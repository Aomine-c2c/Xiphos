import os
import ctypes

def get_memory_usage_mb() -> float:
    if os.name == 'nt':
        class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
            _fields_ = [
                ("cb", ctypes.c_uint32),
                ("PageFaultCount", ctypes.c_uint32),
                ("PeakWorkingSetSize", ctypes.c_size_t),
                ("WorkingSetSize", ctypes.c_size_t),
                ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                ("PagefileUsage", ctypes.c_size_t),
                ("PeakPagefileUsage", ctypes.c_size_t)
            ]
        
        try:
            psapi = ctypes.WinDLL('psapi', use_last_error=True)
            process = ctypes.WinDLL('kernel32', use_last_error=True).GetCurrentProcess()
            counters = PROCESS_MEMORY_COUNTERS()
            counters.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)
            
            if psapi.GetProcessMemoryInfo(process, ctypes.byref(counters), counters.cb):
                return counters.WorkingSetSize / (1024 * 1024)
        except Exception:
            pass
    return 0.0

class CPUTracker:
    def get_cpu_percent(self) -> float:
        # Mock CPU tracker for now since psutil is not available
        return 1.5

cpu_tracker = CPUTracker()
