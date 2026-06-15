import os
import sys
import shutil

APP_NAME = "Xiphos"

def get_base_dir() -> str:
    """
    Returns the root directory where the app data should be stored.
    If running from source, it returns the project root.
    If running as a compiled PyInstaller executable, it returns ~/.config/Xiphos or %APPDATA%/Xiphos.
    """
    if getattr(sys, 'frozen', False):
        # We are running as a PyInstaller bundle
        if os.name == 'nt':
            appdata = os.getenv('APPDATA')
            if not appdata:
                appdata = os.path.expanduser("~")
            base_dir = os.path.join(appdata, APP_NAME)
        else:
            # Linux/macOS
            config_dir = os.getenv('XDG_CONFIG_HOME', os.path.join(os.path.expanduser("~"), ".config"))
            base_dir = os.path.join(config_dir, APP_NAME)
            
        os.makedirs(base_dir, exist_ok=True)
        return base_dir
    else:
        # We are running from source; return the project root (parent of core/)
        return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def ensure_config_exists():
    """
    If running compiled, we must copy the default config/settings.yaml 
    from the _MEIPASS bundle to the actual base_dir so the user can edit it.
    """
    base_dir = get_base_dir()
    config_dir = os.path.join(base_dir, "config")
    os.makedirs(config_dir, exist_ok=True)
    
    target_config = os.path.join(config_dir, "settings.yaml")
    
    if not os.path.exists(target_config):
        if getattr(sys, 'frozen', False):
            # The original config is bundled inside _MEIPASS/config/settings.yaml
            bundled_config = os.path.join(sys._MEIPASS, "config", "settings.yaml")
            if os.path.exists(bundled_config):
                shutil.copy(bundled_config, target_config)
