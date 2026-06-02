#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    port_monitor_lib::run()
}