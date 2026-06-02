use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use windows::Win32::NetworkManagement::IpHelper::{
    GetExtendedTcpTable, GetExtendedUdpTable,
    MIB_TCP6TABLE_OWNER_PID, MIB_TCPTABLE_OWNER_PID,
    MIB_UDPTABLE_OWNER_PID, TCP_TABLE_OWNER_PID_ALL,
    UDP_TABLE_OWNER_PID,
};
use windows::Win32::Networking::WinSock::{AF_INET, AF_INET6};
use windows::Win32::System::ProcessStatus::K32GetModuleFileNameExW;
use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};

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

fn get_tcp_state(state: u32) -> String {
    match state {
        1 => "CLOSED",
        2 => "LISTENING",
        3 => "SYN_SENT",
        4 => "SYN_RECEIVED",
        5 => "ESTABLISHED",
        6 => "FIN_WAIT1",
        7 => "FIN_WAIT2",
        8 => "CLOSE_WAIT",
        9 => "CLOSING",
        10 => "LAST_ACK",
        11 => "TIME_WAIT",
        12 => "DELETE_TCB",
        _ => "UNKNOWN",
    }
    .to_string()
}

fn format_addr_v4(addr: u32, port: u32) -> (String, u16) {
    let ip = format!(
        "{}.{}.{}.{}",
        addr & 0xff,
        (addr >> 8) & 0xff,
        (addr >> 16) & 0xff,
        (addr >> 24) & 0xff
    );
    let p = (port as u16).swap_bytes();
    (format!("{}:{}", ip, p), p)
}

fn format_addr_v6(addr: &[u8; 16], port: u32) -> (String, u16) {
    let groups: Vec<String> = (0..8)
        .map(|i| format!("{:04x}", ((addr[i * 2] as u16) << 8) | addr[i * 2 + 1] as u16))
        .collect();
    let ip = groups.join(":");
    let p = (port as u16).swap_bytes();
    (format!("[{}]:{}", ip, p), p)
}

#[tauri::command]
fn get_port_connections() -> Result<Vec<PortConnection>, String> {
    let mut connections = Vec::new();
    let mut id_counter = 0;

    unsafe {
        let mut buf_len: u32 = 0;
        GetExtendedTcpTable(None, &mut buf_len, false, AF_INET.0 as u32, TCP_TABLE_OWNER_PID_ALL, 0);

        if buf_len > 0 {
            let mut buf = vec![0u8; buf_len as usize];
            if GetExtendedTcpTable(Some(buf.as_mut_ptr() as *mut _), &mut buf_len, false, AF_INET.0 as u32, TCP_TABLE_OWNER_PID_ALL, 0) == 0 {
                let table = &*(buf.as_ptr() as *const MIB_TCPTABLE_OWNER_PID);
                let rows = std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize);
                for row in rows {
                    let (addr_str, port) = format_addr_v4(row.dwLocalAddr, row.dwLocalPort);
                    let (remote_str, _) = format_addr_v4(row.dwRemoteAddr, row.dwRemotePort);
                    connections.push(PortConnection {
                        id: format!("port-{}", id_counter),
                        port,
                        protocol: "TCP".to_string(),
                        local_address: addr_str,
                        remote_address: remote_str,
                        state: get_tcp_state(row.dwState),
                        pid: row.dwOwningPid,
                        process_name: String::new(),
                        process_path: String::new(),
                    });
                    id_counter += 1;
                }
            }
        }

        buf_len = 0;
        GetExtendedTcpTable(None, &mut buf_len, false, AF_INET6.0 as u32, TCP_TABLE_OWNER_PID_ALL, 0);

        if buf_len > 0 {
            let mut buf = vec![0u8; buf_len as usize];
            if GetExtendedTcpTable(Some(buf.as_mut_ptr() as *mut _), &mut buf_len, false, AF_INET6.0 as u32, TCP_TABLE_OWNER_PID_ALL, 0) == 0 {
                let table = &*(buf.as_ptr() as *const MIB_TCP6TABLE_OWNER_PID);
                let rows = std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize);
                for row in rows {
                    let (addr_str, port) = format_addr_v6(&row.ucLocalAddr, row.dwLocalPort);
                    let (remote_str, _) = format_addr_v6(&row.ucRemoteAddr, row.dwRemotePort);
                    connections.push(PortConnection {
                        id: format!("port-{}", id_counter),
                        port,
                        protocol: "TCP6".to_string(),
                        local_address: addr_str,
                        remote_address: remote_str,
                        state: get_tcp_state(row.dwState),
                        pid: row.dwOwningPid,
                        process_name: String::new(),
                        process_path: String::new(),
                    });
                    id_counter += 1;
                }
            }
        }

        buf_len = 0;
        GetExtendedUdpTable(None, &mut buf_len, false, AF_INET.0 as u32, UDP_TABLE_OWNER_PID, 0);

        if buf_len > 0 {
            let mut buf = vec![0u8; buf_len as usize];
            if GetExtendedUdpTable(Some(buf.as_mut_ptr() as *mut _), &mut buf_len, false, AF_INET.0 as u32, UDP_TABLE_OWNER_PID, 0) == 0 {
                let table = &*(buf.as_ptr() as *const MIB_UDPTABLE_OWNER_PID);
                let rows = std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize);
                for row in rows {
                    let (addr_str, port) = format_addr_v4(row.dwLocalAddr, row.dwLocalPort);
                    connections.push(PortConnection {
                        id: format!("port-{}", id_counter),
                        port,
                        protocol: "UDP".to_string(),
                        local_address: addr_str,
                        remote_address: "*:*".to_string(),
                        state: "*".to_string(),
                        pid: row.dwOwningPid,
                        process_name: String::new(),
                        process_path: String::new(),
                    });
                    id_counter += 1;
                }
            }
        }

        buf_len = 0;
        GetExtendedUdpTable(None, &mut buf_len, false, AF_INET6.0 as u32, UDP_TABLE_OWNER_PID, 0);

        if buf_len > 0 {
            let mut buf = vec![0u8; buf_len as usize];
            if GetExtendedUdpTable(Some(buf.as_mut_ptr() as *mut _), &mut buf_len, false, AF_INET6.0 as u32, UDP_TABLE_OWNER_PID, 0) == 0 {
                let table = &*(buf.as_ptr() as *const MIB_UDPTABLE_OWNER_PID);
                let rows = std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize);
                for row in rows {
                    let (addr_str, port) = format_addr_v4(row.dwLocalAddr, row.dwLocalPort);
                    connections.push(PortConnection {
                        id: format!("port-{}", id_counter),
                        port,
                        protocol: "UDP6".to_string(),
                        local_address: addr_str,
                        remote_address: "*:*".to_string(),
                        state: "*".to_string(),
                        pid: row.dwOwningPid,
                        process_name: String::new(),
                        process_path: String::new(),
                    });
                    id_counter += 1;
                }
            }
        }
    }

    let process_map = get_all_process_names();

    for conn in &mut connections {
        conn.process_name = process_map
            .get(&conn.pid)
            .cloned()
            .unwrap_or_else(|| "Unknown".to_string());
        conn.process_path = get_process_path(conn.pid);
    }

    Ok(connections)
}

fn get_all_process_names() -> HashMap<u32, String> {
    let mut map = HashMap::new();

    unsafe {
        if let Ok(snapshot) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
            let mut entry = PROCESSENTRY32W {
                dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                ..Default::default()
            };

            if Process32FirstW(snapshot, &mut entry).is_ok() {
                let name = String::from_utf16_lossy(
                    &entry.szExeFile[..entry.szExeFile.iter().position(|&c| c == 0).unwrap_or(260)],
                );
                map.insert(entry.th32ProcessID, name);

                while Process32NextW(snapshot, &mut entry).is_ok() {
                    let name = String::from_utf16_lossy(
                        &entry.szExeFile
                            [..entry.szExeFile.iter().position(|&c| c == 0).unwrap_or(260)],
                    );
                    map.insert(entry.th32ProcessID, name);
                }
            }
        }
    }

    map
}

fn get_process_path(pid: u32) -> String {
    unsafe {
        if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
            let mut buffer = [0u16; 1024];
            let len = K32GetModuleFileNameExW(Some(handle), None, &mut buffer);
            if len > 0 {
                return String::from_utf16_lossy(&buffer[..len as usize]);
            }
        }
    }
    String::new()
}

#[tauri::command]
fn get_process_details(pid: u32) -> Result<ProcessInfo, String> {
    let process_map = get_all_process_names();
    let name = process_map
        .get(&pid)
        .cloned()
        .unwrap_or_else(|| "Unknown".to_string());
    let path = get_process_path(pid);

    let mut threads = 0u32;
    let mut handles = 0u32;

    unsafe {
        use windows::Win32::System::Threading::GetProcessHandleCount;

        if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION, false, pid) {
            let mut handle_count = 0u32;
            let _ = GetProcessHandleCount(handle, &mut handle_count);
            handles = handle_count;

            if let Ok(snapshot) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                let mut entry = PROCESSENTRY32W {
                    dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                    ..Default::default()
                };

                if Process32FirstW(snapshot, &mut entry).is_ok() {
                    if entry.th32ProcessID == pid {
                        threads = entry.cntThreads;
                    }
                    while Process32NextW(snapshot, &mut entry).is_ok() {
                        if entry.th32ProcessID == pid {
                            threads = entry.cntThreads;
                            break;
                        }
                    }
                }
            }
        }
    }

    Ok(ProcessInfo {
        pid,
        name,
        path,
        cpu_usage: 0.0,
        memory_mb: 0.0,
        threads,
        handles,
    })
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<bool, String> {
    use windows::Win32::System::Threading::{TerminateProcess, PROCESS_TERMINATE};

    unsafe {
        let handle = OpenProcess(PROCESS_TERMINATE, false, pid)
            .map_err(|e| format!("Failed to open process: {}", e))?;
        TerminateProcess(handle, 1).map_err(|e| format!("Failed to kill process: {}", e))?;
    }

    Ok(true)
}

#[tauri::command]
fn suspend_process(pid: u32) -> Result<bool, String> {
    use windows::Win32::System::Threading::{SuspendThread, PROCESS_SUSPEND_RESUME};

    unsafe {
        let handle = OpenProcess(PROCESS_SUSPEND_RESUME, false, pid)
            .map_err(|e| format!("Failed to open process: {}", e))?;
        SuspendThread(handle);
    }

    Ok(true)
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
