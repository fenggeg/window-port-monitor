use encoding_rs::GBK;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;

fn decode_gbk(bytes: &[u8]) -> String {
    let (cow, _, _) = GBK.decode(bytes);
    cow.into_owned()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PortConnection {
    pub id: String,
    pub port: u16,
    pub protocol: String,
    pub local_address: String,
    pub remote_address: String,
    pub state: String,
    pub pid: u32,
    pub process_name: String,
    pub process_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub path: String,
    pub cpu_usage: f32,
    pub memory_mb: f64,
    pub threads: u32,
    pub handles: u32,
}

fn get_all_process_names() -> HashMap<u32, String> {
    let mut map = HashMap::new();
    if let Ok(output) = Command::new("tasklist")
        .args(["/FO", "CSV", "/NH"])
        .output()
    {
        let stdout = decode_gbk(&output.stdout);
        for line in stdout.lines() {
            let parts: Vec<&str> = line.split(',').map(|s| s.trim_matches('"')).collect();
            if parts.len() >= 2 {
                if let Ok(pid) = parts[1].parse::<u32>() {
                    map.insert(pid, parts[0].to_string());
                }
            }
        }
    }
    map
}

#[tauri::command]
fn get_port_connections() -> Result<Vec<PortConnection>, String> {
    let netstat_output = Command::new("netstat")
        .args(["-ano"])
        .output()
        .map_err(|e| format!("Failed to run netstat: {}", e))?;

    let stdout = decode_gbk(&netstat_output.stdout);
    let mut raw_connections = Vec::new();

    for line in stdout.lines().skip(4) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 5 {
            continue;
        }

        let protocol = parts[0].to_string();
        let local_addr = parts[1].to_string();
        let remote_addr = parts[2].to_string();
        let state = if protocol.starts_with("TCP") {
            parts[3].to_string()
        } else {
            "*".to_string()
        };
        let pid: u32 = if protocol.starts_with("TCP") {
            parts[4].parse().unwrap_or(0)
        } else {
            parts[3].parse().unwrap_or(0)
        };

        let port = local_addr
            .split(':')
            .last()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(0);

        raw_connections.push((protocol, local_addr, remote_addr, state, pid, port));
    }

    let process_map = get_all_process_names();

    let connections: Vec<PortConnection> = raw_connections
        .into_iter()
        .enumerate()
        .map(|(i, (protocol, local_addr, remote_addr, state, pid, port))| {
            let process_name = process_map
                .get(&pid)
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string());

            PortConnection {
                id: format!("port-{}", i),
                port,
                protocol,
                local_address: local_addr,
                remote_address: remote_addr,
                state,
                pid,
                process_name,
                process_path: String::new(),
            }
        })
        .collect();

    Ok(connections)
}

#[tauri::command]
fn get_process_details(pid: u32) -> Result<ProcessInfo, String> {
    let output = Command::new("tasklist")
        .args(["/FI", &format!("PID eq {}", pid), "/V", "/FO", "CSV"])
        .output()
        .map_err(|e| format!("Failed to run tasklist: {}", e))?;

    let stdout = decode_gbk(&output.stdout);
    
    for line in stdout.lines().skip(1) {
        let parts: Vec<&str> = line.split(',').map(|s| s.trim_matches('"')).collect();
        if parts.len() >= 8 {
            let name = parts[0].to_string();
            let pid_str = parts[1].to_string();
            let mem_str = parts[4].replace(" K", "").replace(",", "");
            let memory_kb: f64 = mem_str.parse().unwrap_or(0.0);
            
            return Ok(ProcessInfo {
                pid: pid_str.parse().unwrap_or(pid),
                name,
                path: String::new(),
                cpu_usage: 0.0,
                memory_mb: memory_kb / 1024.0,
                threads: 0,
                handles: 0,
            });
        }
    }

    Err(format!("Process with PID {} not found", pid))
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<bool, String> {
    let output = Command::new("taskkill")
        .args(["/F", "/PID", &pid.to_string()])
        .output()
        .map_err(|e| format!("Failed to kill process: {}", e))?;

    if output.status.success() {
        Ok(true)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to kill process: {}", stderr))
    }
}

#[tauri::command]
fn suspend_process(pid: u32) -> Result<bool, String> {
    let output = Command::new("powershell")
        .args([
            "-Command",
            &format!(
                "Suspend-Process -Id {} -ErrorAction Stop",
                pid
            ),
        ])
        .output()
        .map_err(|e| format!("Failed to suspend process: {}", e))?;

    if output.status.success() {
        Ok(true)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to suspend process: {}", stderr))
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_port_connections,
            get_process_details,
            kill_process,
            suspend_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}