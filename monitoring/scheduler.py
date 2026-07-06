from apscheduler.schedulers.background import BackgroundScheduler

from core.logger import log



class JobScheduler:

    def __init__(self):

        self.scheduler = BackgroundScheduler()

        

    def add_m30_job(self, func):
        # TEST MODE: Run every minute instead of '0,30'
        self.scheduler.add_job(func, 'cron', minute='*')
        log.info("Scheduled M30 evaluation job (TEST MODE: 1-min interval).")

        

    def add_trailing_job(self, func):

        

        self.scheduler.add_job(func, 'interval', minutes=1)

        log.info("Scheduled trailing job.")

        

    def start(self):

        self.scheduler.start()

        log.info("APScheduler started.")

        

    def stop(self):

        self.scheduler.shutdown()



scheduler = JobScheduler()

