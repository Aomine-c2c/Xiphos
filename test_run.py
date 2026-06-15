from live_bot import LiveBot
import MetaTrader5 as mt5

def test():
    print("Testing live_bot execution cycle...")
    bot = LiveBot()
    bot.evaluate_gates_and_execute()
    mt5.shutdown()
    print("Cycle complete.")

if __name__ == "__main__":
    test()
