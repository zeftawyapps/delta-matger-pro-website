#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚀 Delta Matger Pro - Next.js Multi-Tenant & Multi-Organization Configuration Generator
This script parses the selected client and organization configuration from
`project_builder/clients/<client>.yaml` and dynamically generates:
  - `src/config/clientConfig.json` (Full runtime config, SEO, policies, social, footer)
  - `.env.local` (Next.js environment variables)
  - `firebase.json` (Hosting site & frameworksBackend SSR region)
  - `.firebaserc` (Firebase project binding)
  - `project_builder/config.yaml` (Active client & org pointers)
  - `project_builder/version_history.md` (Deployment audit trail)
"""

import os
import sys
import json
import re
import shutil
import datetime

def _parse_val(v):
    # Strip trailing comments if not enclosed in quotes
    v = v.strip()
    if '#' in v:
        if not ((v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'"))):
            v = v.split('#', 1)[0].strip()
            
    if v.startswith('"') and v.endswith('"') and len(v) >= 2:
        return v[1:-1]
    if v.startswith("'") and v.endswith("'") and len(v) >= 2:
        return v[1:-1]
    if v.lower() == 'true':
        return True
    if v.lower() == 'false':
        return False
    if v.lower() == 'null' or v == '~':
        return None
    try:
        if '.' in v:
            return float(v)
        return int(v)
    except ValueError:
        return v

def parse_simple_yaml(filepath):
    """
    Lightweight zero-dependency YAML parser supporting nested dicts,
    lists of dicts/scalars (- item), multiline blocks (|), booleans, and integers.
    """
    if not os.path.exists(filepath):
        print(f"❌ Error: File '{filepath}' not found!")
        sys.exit(1)
        
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
        
    lines = text.splitlines()
    root = {}
    
    # State tracking: stack of (indent_level, container, key_in_parent)
    stack = [( -1, root, None )]
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines and comments
        if not stripped or stripped.startswith('#'):
            i += 1
            continue
            
        indent = len(line) - len(line.lstrip())
        
        # Pop stack if current indent <= stack top indent
        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()
            
        current_indent, current_container, current_key = stack[-1]
        
        # Case 1: List item (- item or - key: val)
        if stripped.startswith('-'):
            item_content = stripped[1:].strip()
            
            if not item_content:
                # Empty item: - followed by nested dict on next lines
                new_dict = {}
                if isinstance(current_container, list):
                    current_container.append(new_dict)
                stack.append((indent, new_dict, None))
                i += 1
                continue
                
            if ':' in item_content:
                k, v = item_content.split(':', 1)
                k = k.strip()
                v = v.strip()
                new_dict = {}
                if isinstance(current_container, list):
                    current_container.append(new_dict)
                
                # Check for multiline |
                if v == '|':
                    block_lines = []
                    block_indent = None
                    j = i + 1
                    while j < len(lines):
                        nxt = lines[j]
                        nxt_s = nxt.strip()
                        if not nxt_s:
                            block_lines.append("")
                            j += 1
                            continue
                        nxt_indent = len(nxt) - len(nxt.lstrip())
                        if block_indent is None:
                            if nxt_indent > indent:
                                block_indent = nxt_indent
                            else:
                                break
                        if nxt_indent >= block_indent:
                            block_lines.append(nxt[block_indent:])
                            j += 1
                        else:
                            break
                    new_dict[k] = "\n".join(block_lines) + "\n"
                    i = j
                    stack.append((indent, new_dict, None))
                    continue
                elif v == "":
                    nested_dict = {}
                    new_dict[k] = nested_dict
                    stack.append((indent, new_dict, None))
                    stack.append((indent + 2, nested_dict, k))
                else:
                    new_dict[k] = _parse_val(v)
                    stack.append((indent, new_dict, None))
            else:
                if isinstance(current_container, list):
                    current_container.append(_parse_val(item_content))
            i += 1
            continue
            
        # Case 2: Key-Value pair (key: val)
        if ':' in stripped:
            k, v = stripped.split(':', 1)
            k = k.strip()
            v = v.strip()
            
            # Check for multiline string block (|)
            if v == '|':
                block_lines = []
                block_indent = None
                j = i + 1
                while j < len(lines):
                    nxt = lines[j]
                    nxt_s = nxt.strip()
                    if not nxt_s:
                        block_lines.append("")
                        j += 1
                        continue
                    nxt_indent = len(nxt) - len(nxt.lstrip())
                    if block_indent is None:
                        if nxt_indent > indent:
                            block_indent = nxt_indent
                        else:
                            break
                    if nxt_indent >= block_indent:
                        block_lines.append(nxt[block_indent:])
                        j += 1
                    else:
                        break
                val_parsed = "\n".join(block_lines) + "\n"
                if isinstance(current_container, dict):
                    current_container[k] = val_parsed
                i = j
                continue
            
            # Case 3: Key starting a list or nested dict
            if v == "":
                # Check next non-empty, non-comment line to determine if it's list or dict
                nxt_idx = i + 1
                is_list = False
                while nxt_idx < len(lines):
                    nxt_line = lines[nxt_idx].strip()
                    if nxt_line and not nxt_line.startswith('#'):
                        if nxt_line.startswith('-'):
                            is_list = True
                        break
                    nxt_idx += 1
                
                if is_list:
                    new_list = []
                    if isinstance(current_container, dict):
                        current_container[k] = new_list
                    stack.append((indent, new_list, k))
                else:
                    new_dict = {}
                    if isinstance(current_container, dict):
                        current_container[k] = new_dict
                    stack.append((indent, new_dict, k))
                i += 1
                continue
                
            # Regular key: scalar value
            if isinstance(current_container, dict):
                current_container[k] = _parse_val(v)
            i += 1
            continue
            
        i += 1
        
    return root

def get_organizations(client_config):
    """
    Extract organizations list from config. If absent (legacy single-tenant),
    builds a default fallback organization from root fields.
    """
    raw_orgs = client_config.get("organizations")
    if isinstance(raw_orgs, list) and len(raw_orgs) > 0:
        return raw_orgs
        
    # Legacy fallback: Build synthetic organization from root
    branding = client_config.get("appBranding", {})
    firebase_cfg = client_config.get("firebase", {})
    hosting_cfg = firebase_cfg.get("hosting", {})
    
    hosting_site = (
        hosting_cfg.get("website") or
        hosting_cfg.get("websit") or
        hosting_cfg.get("client") or
        hosting_cfg.get("cleint") or
        hosting_cfg.get("dashboard") or
        ""
    )
    
    legacy_org = {
        "orgId": "default",
        "isDefaultTest": True,
        "defaultOrgName": branding.get("defaultOrgName", "deltastore"),
        "hostingSite": hosting_site,
        "appTitle": branding.get("appTitle", "Delta Store"),
        "logo": branding.get("logo", "logo/domansy.jpg"),
        "seo": {
            "appDescription": branding.get("appDescription", "متجرك الإلكتروني للتسوق وتلبية كافة احتياجاتك."),
            "keywords": "متجر, تسوق, إلكتروني",
            "themeColor": "#D4AF37"
        },
        "socialMedia": {},
        "footer": {},
        "policies": {}
    }
    return [legacy_org]

def find_target_org(orgs, requested_org_id=None):
    if requested_org_id and requested_org_id not in ["default_auto", "", "all", "all_orgs"]:
        for org in orgs:
            if str(org.get("orgId", "")).lower() == requested_org_id.lower():
                return org
                
    # Fallback to org with isDefaultTest == True
    for org in orgs:
        if org.get("isDefaultTest") is True:
            return org
            
    # Default to first org in list
    return orgs[0] if orgs else None

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    # Arguments: python3 configure.py <client_name> [org_id] [action]
    # Special query flags:
    #   python3 configure.py <client_name> --list-orgs
    #   python3 configure.py <client_name> --get-default-org
    args = sys.argv[1:]
    client_name = None
    requested_org_id = None
    action = "config"
    
    if len(args) >= 1:
        client_name = args[0].lower()
        
    if not client_name:
        config_path = os.path.join(script_dir, "config.yaml")
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                for line in f:
                    stripped = line.strip()
                    if stripped.startswith("activeClient:"):
                        val = stripped.split(":", 1)[1].strip().strip('\'"')
                        client_name = val.strip().lower()
                    if stripped.startswith("activeOrg:"):
                        val = stripped.split(":", 1)[1].strip().strip('\'"')
                        requested_org_id = val.strip().lower()

    if not client_name:
        print("❌ Error: No client specified. Please provide client name as argument.")
        sys.exit(1)

    client_yaml_filename = f"{client_name}.yaml"
    client_yaml_path = os.path.join(script_dir, "clients", client_yaml_filename)
    
    # Sync from sibling client-app if not found locally
    if not os.path.exists(client_yaml_path):
        sibling_clients_path = os.path.abspath(os.path.join(project_root, "..", "delta-mager-pro-client-app", "project_builder", "clients", client_yaml_filename))
        if os.path.exists(sibling_clients_path):
            print(f"🔄 Syncing config for '{client_name}' from client app...")
            shutil.copy2(sibling_clients_path, client_yaml_path)
        else:
            print(f"❌ Error: Client configuration file '{client_yaml_filename}' not found locally or in client app!")
            sys.exit(1)
        
    client_config = parse_simple_yaml(client_yaml_path)
    orgs = get_organizations(client_config)

    # ------------------------------------------------------------------
    # Query Flags for Bash Orchestration
    # ------------------------------------------------------------------
    if len(args) >= 2 and args[1] == "--list-orgs":
        for org in orgs:
            o_id = org.get("orgId", "default")
            is_def = "1" if org.get("isDefaultTest") is True else "0"
            title = org.get("appTitle", o_id)
            site = org.get("hostingSite", "")
            d_name = org.get("defaultOrgName", "")
            print(f"{o_id}|{is_def}|{title}|{site}|{d_name}")
        sys.exit(0)

    if len(args) >= 2 and args[1] == "--get-default-org":
        def_org = find_target_org(orgs, None)
        print(def_org.get("orgId", "default") if def_org else "default")
        sys.exit(0)

    # Parse remaining arguments: [org_id] [action]
    known_actions = ["run", "build-run", "deploy", "config", "build", "clean"]
    if len(args) == 2:
        if args[1].lower() in known_actions:
            action = args[1].lower()
        else:
            requested_org_id = args[1].lower()
    elif len(args) >= 3:
        requested_org_id = args[1].lower()
        action = args[2].lower()

    target_org = find_target_org(orgs, requested_org_id)
    if not target_org:
        print(f"❌ Error: Organization '{requested_org_id}' not found in client '{client_name}'!")
        sys.exit(1)

    target_org_id = target_org.get("orgId", "default")
    default_org_name = target_org.get("defaultOrgName", "deltastore")
    hosting_site = target_org.get("hostingSite", "")
    app_title = target_org.get("appTitle", "Delta Store")
    logo = target_org.get("logo", "logo/domansy.jpg")
    
    seo_cfg = target_org.get("seo", {}) if isinstance(target_org.get("seo"), dict) else {}
    app_description = seo_cfg.get("appDescription", "متجرك الإلكتروني للتسوق وتلبية كافة احتياجاتك.")
    keywords = seo_cfg.get("keywords", "متجر, تسوق, إلكتروني")
    theme_color = seo_cfg.get("themeColor", "#D4AF37")
    
    social_media = target_org.get("socialMedia", {}) if isinstance(target_org.get("socialMedia"), dict) else {}
    footer_cfg = target_org.get("footer", {}) if isinstance(target_org.get("footer"), dict) else {}
    policies_cfg = target_org.get("policies", {}) if isinstance(target_org.get("policies"), dict) else {}

    app_version = client_config.get("appVersion", "1.0.0")
    appBuildIndex = client_config.get("appBuildIndex", "1")
    enable_demo_mock_data = client_config.get("enableDemoMockData", False)

    # Firebase configurations
    firebase_cfg = client_config.get("firebase", {})
    firebase_project = firebase_cfg.get("project", "domansy-dev")
    firebase_region = firebase_cfg.get("region", "me-central1")

    # Environment and Base URLs
    active_env = client_config.get("env", "local" if client_name == "local" else "prod")
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

    print(f"\n⚙️ Configuring web environment for client: \033[1;32m{client_name.upper()}\033[0m (Org: \033[1;36m{target_org_id}\033[0m)...")
    print(f"  Firebase Project: {firebase_project}")
    print(f"  Hosting Site: {hosting_site}")
    print(f"  Firebase Region: {firebase_region}")
    print(f"  Active Env: {active_env}")
    print(f"  API Base URL: {base_url}")
    print(f"  Image URL: {image_url}")
    print(f"  Default Org Name: {default_org_name}")
    print(f"  App Title: {app_title}")
    print(f"  Theme Color: {theme_color}")
    print(f"  App Version: {app_version} (Build: {appBuildIndex})")

    # ------------------------------------------------------------------
    # 1. Write dynamic .firebaserc to root
    # ------------------------------------------------------------------
    firebaserc_content = {
        "projects": {
            "default": firebase_project
        }
    }
    with open(os.path.join(project_root, ".firebaserc"), 'w', encoding='utf-8') as f:
        json.dump(firebaserc_content, f, indent=2)

    # ------------------------------------------------------------------
    # 2. Write dynamic firebase.json pointing to the SPECIFIC site directly!
    # ------------------------------------------------------------------
    firebase_json_content = {
        "hosting": {
            "site": hosting_site,
            "source": ".",
            "ignore": ["firebase.json", "**/node_modules/**"],
            "frameworksBackend": {
                "region": firebase_region
            }
        }
    }
    with open(os.path.join(project_root, "firebase.json"), 'w', encoding='utf-8') as f:
        json.dump(firebase_json_content, f, indent=2)

    # ------------------------------------------------------------------
    # 3. Handle Logo Copying and Favicon Updates
    # ------------------------------------------------------------------
    favicon_path = os.path.join(project_root, "src", "app", "favicon.ico")
    favicon_bak_path = os.path.join(project_root, "src", "app", "favicon.ico.bak")
    public_favicon_path = os.path.join(project_root, "public", "favicon.ico")
    
    if os.path.exists(favicon_path) and not os.path.exists(favicon_bak_path):
        shutil.copy2(favicon_path, favicon_bak_path)
        
    logo_url = ""
    if logo:
        # Search local project_builder/clients/ first, then fallback to sibling
        local_logo_source = os.path.join(script_dir, "clients", logo)
        sibling_logo_source = os.path.abspath(os.path.join(project_root, "..", "delta-mager-pro-client-app", "project_builder", "clients", logo))
        
        resolved_logo_path = None
        if os.path.exists(local_logo_source):
            resolved_logo_path = local_logo_source
        elif os.path.exists(sibling_logo_source):
            resolved_logo_path = sibling_logo_source
            
        if resolved_logo_path:
            public_logo_dir = os.path.join(project_root, "public", "images", "logo")
            os.makedirs(public_logo_dir, exist_ok=True)
            logo_ext = os.path.splitext(resolved_logo_path)[1]
            logo_dest_filename = f"logo_{client_name}_{target_org_id}{logo_ext}"
            logo_dest_path = os.path.join(public_logo_dir, logo_dest_filename)
            shutil.copy2(resolved_logo_path, logo_dest_path)
            logo_url = f"/images/logo/{logo_dest_filename}"
            print(f"  🖼️ Synced org logo to {logo_url}")
            
            # Sync as favicon
            shutil.copy2(resolved_logo_path, favicon_path)
            if os.path.exists(os.path.dirname(public_favicon_path)):
                shutil.copy2(resolved_logo_path, public_favicon_path)
        else:
            print(f"  ⚠️ Warning: Logo image '{logo}' not found at {local_logo_source}")
    else:
        if os.path.exists(favicon_bak_path):
            shutil.copy2(favicon_bak_path, favicon_path)
            if os.path.exists(os.path.dirname(public_favicon_path)):
                shutil.copy2(favicon_bak_path, public_favicon_path)

    # ------------------------------------------------------------------
    # 4. Generate .env.local for Next.js
    # ------------------------------------------------------------------
    env_local_path = os.path.join(project_root, ".env.local")
    env_lines = [
        f"NEXT_PUBLIC_BASE_URL={base_url}",
        f"NEXT_PUBLIC_IMAGE_URL={image_url}",
        f"NEXT_PUBLIC_DEFAULT_ORG_NAME={default_org_name}",
        f"NEXT_PUBLIC_APP_TITLE={app_title}",
        f"NEXT_PUBLIC_APP_VERSION={app_version}",
        f"NEXT_PUBLIC_APP_BUILD_INDEX={appBuildIndex}",
        f"NEXT_PUBLIC_ENABLE_DEMO_MOCK_DATA={'true' if enable_demo_mock_data else 'false'}",
        f"NEXT_PUBLIC_ACTIVE_CLIENT={client_name}",
        f"NEXT_PUBLIC_ACTIVE_ORG={target_org_id}",
        f"NEXT_PUBLIC_THEME_COLOR={theme_color}",
    ]
    with open(env_local_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(env_lines) + "\n")
    print(f"  📝 Generated .env.local")

    # ------------------------------------------------------------------
    # 5. Generate src/config/clientConfig.json
    # ------------------------------------------------------------------
    config_json_dir = os.path.join(project_root, "src", "config")
    os.makedirs(config_json_dir, exist_ok=True)
    
    client_config_json = {
        "activeClient": client_name,
        "activeOrg": target_org_id,
        "defaultOrgName": default_org_name,
        "hostingSite": hosting_site,
        "env": active_env,
        "baseUrl": base_url,
        "imageUrl": image_url,
        "appTitle": app_title,
        "appDescription": app_description,
        "keywords": keywords,
        "themeColor": theme_color,
        "appVersion": app_version,
        "appBuildIndex": int(appBuildIndex) if str(appBuildIndex).isdigit() else appBuildIndex,
        "logoUrl": logo_url,
        "enableDemoMockData": enable_demo_mock_data,
        "socialMedia": social_media,
        "footer": footer_cfg,
        "policies": policies_cfg,
        "seo": seo_cfg
    }
    
    with open(os.path.join(config_json_dir, "clientConfig.json"), 'w', encoding='utf-8') as f:
        json.dump(client_config_json, f, indent=2, ensure_ascii=False)
    print(f"  📝 Generated clientConfig.json at src/config/")

    # ------------------------------------------------------------------
    # 6. Update package.json version
    # ------------------------------------------------------------------
    package_json_path = os.path.join(project_root, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                pkg_data = json.load(f)
            pkg_data["version"] = str(app_version)
            with open(package_json_path, 'w', encoding='utf-8') as f:
                json.dump(pkg_data, f, indent=2)
        except Exception as e:
            print(f"  ⚠️ Warning: Could not update package.json version: {e}")

    # ------------------------------------------------------------------
    # 7. Rewrite project_builder/config.yaml activeClient & activeOrg
    # ------------------------------------------------------------------
    config_yaml_content = f"""# 🌐 Active Client Configuration
# Dynamically generated by project_builder. Do not edit directly.

activeClient: "{client_name}"
activeOrg: "{target_org_id}"

appVersion: "{app_version}"
appBuildIndex: {appBuildIndex}

# 🌍 Active environment (local, dev, prod)
env: "{active_env}"

# 🔥 Firebase Project
firebaseProject: "{firebase_project}"
"""
    with open(os.path.join(script_dir, "config.yaml"), 'w', encoding='utf-8') as f:
        f.write(config_yaml_content)

    # ------------------------------------------------------------------
    # 8. Log deployment to version_history.md
    # ------------------------------------------------------------------
    history_path = os.path.join(script_dir, "version_history.md")
    if not os.path.exists(history_path):
        with open(history_path, 'w', encoding='utf-8') as f:
            f.write("# 📜 سجل تحديثات وإصدارات موقع الويب (Website Deployment History)\n\n")
            f.write("يحتوي هذا الملف على سجل تاريخي لجميع عمليات البناء والنشر والتهيئة لموقع الويب.\n\n")
            f.write("| التاريخ والوقت | اسم العميل | المنظمة | رقم الإصدار (Version) | رقم البناء (Build) | موقع الاستضافة (Site) | نوع العملية (Action) | الحالة (Status) |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n")
            
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    action_labels = {
        "run": "💻 تشغيل محلي (Local Serve)",
        "build-run": "💻 بناء وتشغيل محلي (Build & Run Locally)",
        "deploy": "🚀 رفع للاستضافة (Firebase Deploy)",
        "config": "⚙️ تهيئة ملفات (Configure Only)",
        "build": "📦 بناء محلي فقط (Build Locally)"
    }
    action_label = action_labels.get(action, f"⚙️ {action}")
    status = "✅ ناجح"
    
    row = f"| {now} | **{client_name.upper()}** | `{target_org_id}` | {app_version} | {appBuildIndex} | `{hosting_site}` | {action_label} | {status} |\n"
    
    with open(history_path, 'a', encoding='utf-8') as f:
        f.write(row)
    
    print(f"\n\033[1;32m🎉 Web configuration successfully generated for '{client_name}' (Org: '{target_org_id}')!\033[0m\n")

if __name__ == '__main__':
    main()
