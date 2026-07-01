import queue
import threading
from loguru import logger
import time

class TradeExecutionWorker:
    def __init__(self):
        self.cmd_queue = queue.Queue()
        self.worker_thread = None
        self.running = False

    def start(self):
        if self.running:
            return
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()
        logger.info("Trade Execution Worker started.")

    def stop(self):
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=2.0)
        logger.info("Trade Execution Worker stopped.")

    def enqueue(self, target_func, *args, **kwargs):
        self.cmd_queue.put((target_func, args, kwargs))

    def _worker_loop(self):
        while self.running:
            try:
                # Block for up to 0.5s to allow checking self.running
                target_func, args, kwargs = self.cmd_queue.get(timeout=0.5)
                try:
                    target_func(*args, **kwargs)
                except Exception as e:
                    logger.error(f"Error executing queued trade command {target_func.__name__}: {e}")
                finally:
                    self.cmd_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Worker queue error: {e}")
                time.sleep(1)

trade_worker = TradeExecutionWorker()
