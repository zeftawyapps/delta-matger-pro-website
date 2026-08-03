#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚀 Delta Matger Pro - Next.js Multi-Tenant Configuration Generator
This script parses the selected client's YAML configuration directly from
`project_builder/clients/<client>.yaml` and dynamically generates Next.js config,
`.firebaserc`, and `firebase.json` for hosting.
"""

import os
import sys
import json
import shutil

def parse_simple_yaml(filepath):
    """
    A lightweight, zero-dependency YAML parser.
    """
    if not os.path.exists(filepath):
        print(f"❌ Error: Config file not found at {filepath}")
        sys.exit(1)
        
    data = {}
    stack = [(0, data)] # (indentation, current_dict)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                continue
                
            indent = len(line) - len(line.lstrip())
            
            if ':' not in stripped:
                continue
            
            key, val = stripped.split(':', 1)
            key = key.strip()
            val = val.strip()
            
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
                
            while stack and indent <= stack[-1][0] and len(stack) > 1:
                stack.pop()
                
            current_dict = stack[-1][1]
            
            if val == "":
                new_dict = {}
                current_dict[key] = new_dict
                stack.append((indent, new_dict))
            else:
                current_dict[key] = val
                
    return data

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    client_name = None
    action = "config"

    # 1. Determine active client and action from command line args or config.yaml
    if len(sys.argv) >= 2:
        client_name = sys.argv[1].lower()
    else:
        # Fallback to reading from config.yaml
        config_path = os.path.join(script_dir, "config.yaml")
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                for line in f:
                    stripped = line.strip()
                    if stripped.startswith("activeClient:"):
                        val = stripped.split(":", 1)[1].strip()
                        if val.startswith('"') and val.endswith('"'):
                            val = val[1:-1]
                        elif val.startswith("'") and val.endswith("'"):
                            val = val[1:-1]
                        client_name = val.strip().lower()
                        break

    if len(sys.argv) >= 3:
        action = sys.argv[2].lower()

    if not client_name:
        print("❌ Error: No client specified. Please provide as argument or set 'activeClient' in project_builder/config.yaml")
        sys.exit(1)

    # 2. Check local client yaml, copy from sibling client app if missing
    client_yaml_filename = f"{client_name}.yaml"
    local_clients_dir = os.path.join(script_dir, "clients")
    os.makedirs(local_clients_dir, exist_ok=True)
    client_yaml_path = os.path.join(local_clients_dir, client_yaml_filename)

    if not os.path.exists(client_yaml_path):
        sibling_clients_path = os.path.abspath(os.path.join(project_root, "..", "delta-mager-pro-client-app", "project_builder", "clients", client_yaml_filename))
        if os.path.exists(sibling_clients_path):
            print(f"🔄 Syncing config for '{client_name}' from client app...")
            shutil.copy2(sibling_clients_path, client_yaml_path)
        else:
            print(f"❌ Error: Client configuration file '{client_yaml_filename}' not found locally or in client app!")
            sys.exit(1)
        
    client_config = parse_simple_yaml(client_yaml_path)
    
    app_version = client_config.get("appVersion", "1.0.0")
    app_build_index = client_config.get("appBuildIndex", "1")
    
    # Extract branding configurations
    branding_cfg = client_config.get("appBranding", {})
    app_title = branding_cfg.get("appTitle", "Domancy")
    default_org_name = branding_cfg.get("defaultOrgName", "domacy")
    app_description = branding_cfg.get("appDescription", "دومانسي - متجرك الإلكتروني للتسوق وتلبية كافة احتياجاتك.")
    logo = branding_cfg.get("logo")
    
    # Extract firebase configurations
    firebase_cfg = client_config.get("firebase", {})
    firebase_project = firebase_cfg.get("project", "domansy-dev")
    hosting_cfg = firebase_cfg.get("hosting", {})
    
    # Support 'website', 'websit', 'client', 'cleint', fallback to 'dashboard' (storefront for this website)
    hosting_site = (
        hosting_cfg.get("website") or
        hosting_cfg.get("websit") or
        hosting_cfg.get("client") or 
        hosting_cfg.get("cleint") or 
        hosting_cfg.get("dashboard") or 
        ""
    )
    
    # Active environment ('local', 'dev', 'prod' - default to prod)
    active_env = client_config.get("env", "local" if client_name == "local" else "prod")
    
    # Determine base URLs
    root_base_url = client_config.get("baseUrl")
    root_image_url = client_config.get("imageUrl")
    
    base_url = ""
    image_url = ""
    
    if root_base_url and str(root_base_url).strip():
        base_url = str(root_base_url).strip()
    else:
        env_urls = client_config.get("envUrls", {})
        active_env_urls = env_urls.get(active_env, {})
        base_url = active_env_urls.get("baseUrl", "")
        
    if root_image_url and str(root_image_url).strip():
        image_url = str(root_image_url).strip()
    else:
        env_urls = client_config.get("envUrls", {})
        active_env_urls = env_urls.get(active_env, {})
        image_url = active_env_urls.get("imageUrl", "")

    print(f"\n⚙️ Configuring web environment for client: \033[1;32m{client_name.upper()}\033[0m...")
    print(f"  Firebase Project: {firebase_project}")
    print(f"  Hosting Site: {hosting_site}")
    print(f"  Active Env: {active_env}")
    print(f"  API Base URL: {base_url}")
    print(f"  Image URL: {image_url}")
    print(f"  Default Org Name: {default_org_name}")
    print(f"  App Version: {app_version} (Build: {app_build_index})")
    
    # 3. Write dynamic .firebaserc to root
    firebaserc_content = {
        "projects": {
            "default": firebase_project
        }
    }
    with open(os.path.join(project_root, ".firebaserc"), 'w', encoding='utf-8') as f:
        json.dump(firebaserc_content, f, indent=2)
        
    # 4. Write dynamic firebase.json pointing to the SPECIFIC site directly!
    firebase_json_content = {
        "hosting": {
            "site": hosting_site,
            "source": ".",
            "ignore": ["firebase.json", "**/node_modules/**"],
            "frameworksBackend": {
                "region": "us-central1"
            }
        }
    }
    with open(os.path.join(project_root, "firebase.json"), 'w', encoding='utf-8') as f:
        json.dump(firebase_json_content, f, indent=2)
        
    # 5. Handle Logo Copying and Favicon Updates
    favicon_path = os.path.join(project_root, "src", "app", "favicon.ico")
    favicon_bak_path = os.path.join(project_root, "src", "app", "favicon.ico.bak")
    public_favicon_path = os.path.join(project_root, "public", "favicon.ico")
    
    # Backup default favicon if not already backed up
    if os.path.exists(favicon_path) and not os.path.exists(favicon_bak_path):
        shutil.copy2(favicon_path, favicon_bak_path)
        
    logo_url = ""
    if logo:
        logo_src_path = os.path.join(script_dir, "clients", logo)
        if os.path.exists(logo_src_path):
            print(f"🖼️  Found client logo at {logo_src_path}")
            
            # Destination path inside public directory
            logo_dest_path = os.path.join(project_root, "public", logo)
            logo_dest_dir = os.path.dirname(logo_dest_path)
            os.makedirs(logo_dest_dir, exist_ok=True)
            
            # Copy logo to public folder
            shutil.copy2(logo_src_path, logo_dest_path)
            print(f"  📝 Copied logo to public folder: {logo_dest_path}")
            
            # Overwrite favicons
            shutil.copy2(logo_src_path, favicon_path)
            shutil.copy2(logo_src_path, public_favicon_path)
            print(f"  📝 Copied logo as favicon: {favicon_path}")
            
            logo_url = f"/{logo.lstrip('/')}"
        else:
            print(f"⚠️  Warning: Client logo file '{logo}' not found at {logo_src_path}")
    else:
        # Restore default favicon if logo is not specified
        if os.path.exists(favicon_bak_path):
            shutil.copy2(favicon_bak_path, favicon_path)
            shutil.copy2(favicon_bak_path, public_favicon_path)
            print(f"🔄 Restored default favicon.")
            
    # 6. Write configuration json for Next.js to use
    config_json_dir = os.path.join(project_root, "src", "config")
    os.makedirs(config_json_dir, exist_ok=True)
    
    raw_mock_flag = client_config.get("enableDemoMockData", False)
    enable_demo_mock_data = str(raw_mock_flag).strip().lower() == "true" if isinstance(raw_mock_flag, (str, bool)) else False

    client_config_json = {
        "activeClient": client_name,
        "defaultOrgName": default_org_name,
        "env": active_env,
        "baseUrl": base_url,
        "imageUrl": image_url,
        "appTitle": app_title,
        "appDescription": app_description,
        "appVersion": app_version,
        "appBuildIndex": int(app_build_index) if str(app_build_index).isdigit() else 1,
        "logoUrl": logo_url,
        "enableDemoMockData": enable_demo_mock_data
    }
    
    with open(os.path.join(config_json_dir, "clientConfig.json"), 'w', encoding='utf-8') as f:
        json.dump(client_config_json, f, indent=2)
    print(f"  📝 Generated clientConfig.json at src/config/")

    # 6. Rewrite/update project_builder/config.yaml activeClient pointers
    config_yaml_content = f"""# 🌐 Active Client Configuration
# Dynamic generated from clients/{client_name}.yaml. Do not edit directly.

activeClient: "{client_name}"

appVersion: "{app_version}"
appBuildIndex: {app_build_index}

# 🌍 Active environment (local, dev, prod)
env: "{active_env}"

# 🔥 Firebase Project
firebaseProject: "{firebase_project}"
"""
    with open(os.path.join(script_dir, "config.yaml"), 'w', encoding='utf-8') as f:
        f.write(config_yaml_content)

    # 7. Log configuration and deployment details to version_history.md
    import datetime
    history_path = os.path.join(script_dir, "version_history.md")
    
    if not os.path.exists(history_path):
        with open(history_path, 'w', encoding='utf-8') as f:
            f.write("# 📜 سجل تحديثات وإصدارات موقع الويب (Website Deployment History)\n\n")
            f.write("يحتوي هذا الملف على سجل تاريخي لجميع عمليات البناء والنشر والتهيئة لموقع الويب.\n\n")
            f.write("| التاريخ والوقت | اسم العميل | رقم الإصدار (Version) | رقم البناء (Build) | نوع العملية (Action) | الحالة (Status) |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
            
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    action_labels = {
        "run": "💻 تشغيل محلي (Local Serve)",
        "build-run": "💻 بناء وتشغيل محلي (Build & Run Locally)",
        "deploy": "🚀 رفع للاستضافة (Firebase Deploy)",
        "config": "⚙️ تهيئة ملفات (Configure Only)"
    }
    action_label = action_labels.get(action, f"⚙️ {action}")
    status = "✅ ناجح"
    
    row = f"| {now} | **{client_name.upper()}** | {app_version} | {app_build_index} | {action_label} | {status} |\n"
    
    with open(history_path, 'a', encoding='utf-8') as f:
        f.write(row)
    
    print(f"\n\033[1;32m🎉 Web configuration successfully generated for '{client_name}'!\033[0m\n")

if __name__ == '__main__':
    main()
