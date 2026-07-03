import os

import psutil



def get_memory_usage_mb() -> float:

    try:

        process = psutil.Process(os.getpid())

        

        return process.memory_info().rss / (1024 * 1024)

    except Exception:

        return 0.0



def get_system_disk_usage_percent() -> float:

    try:

        

        return psutil.disk_usage(os.getcwd()).percent

    except Exception:

        return 0.0



class CPUTracker:

    def __init__(self):

        

        psutil.cpu_percent(interval=None)

        

    def get_cpu_percent(self) -> float:

        try:

            return psutil.cpu_percent(interval=None)

        except Exception:

            return 0.0



cpu_tracker = CPUTracker()

