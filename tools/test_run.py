from main import process_m30_cycle
from bridge.proxy import mt5

def test():
    print("Testing cycle execution...")
    process_m30_cycle()
    mt5.shutdown()
    print("Cycle complete.")

if __name__ == "__main__":
    test()
