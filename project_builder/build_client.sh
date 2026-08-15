#!/bin/bash

# 🎨 Modern High-Intensity Colors
RED='\033[0;91m'
GREEN='\033[0;92m'
BLUE='\033[0;94m'
CYAN='\033[0;96m'
YELLOW='\033[0;93m'
PURPLE='\033[0;95m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}   🚀 Delta Matger Pro - Next.js Multi-Org Builder    ${NC}"
echo -e "${CYAN}${BOLD}======================================================${NC}"

WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILDER_DIR="$WEBSITE_DIR/project_builder"

# 1. Discover available clients dynamically from project_builder/clients/
CLIENTS=()
for file in "$BUILDER_DIR"/clients/*.yaml; do
    if [ -f "$file" ]; then
        client_filename=$(basename "$file")
        client_name="${client_filename%.yaml}"
        CLIENTS+=("$client_name")
    fi
done

CLIENT_ARG=""
ORG_ARG=""
ACTION=""

# Parse direct arguments from command line
# Possible shapes:
#   ./build_client.sh run | deploy | build | config
#   ./build_client.sh tantest run | deploy
#   ./build_client.sh tantest fashion-hub deploy
#   ./build_client.sh tantest all deploy
KNOWN_ACTIONS="run build-run deploy clean config build"

if [ -n "$1" ]; then
    if [[ " $KNOWN_ACTIONS " =~ " $1 " ]]; then
        ACTION="$1"
    else
        CLIENT_ARG="$1"
    fi
fi

if [ -n "$2" ]; then
    if [[ " $KNOWN_ACTIONS " =~ " $2 " ]]; then
        ACTION="$2"
    else
        ORG_ARG="$2"
    fi
fi

if [ -n "$3" ]; then
    if [[ " $KNOWN_ACTIONS " =~ " $3 " ]]; then
        ACTION="$3"
    fi
fi

DEFAULT_CLIENT=""
DEFAULT_ORG=""
if [ -f "$BUILDER_DIR/config.yaml" ]; then
    DEFAULT_CLIENT=$(grep -E "^activeClient:" "$BUILDER_DIR/config.yaml" | head -n 1 | sed -E "s/activeClient:[[:space:]]*['\"]?([^'\"]+)['\"]?/\1/" | tr -d '\r')
    DEFAULT_ORG=$(grep -E "^activeOrg:" "$BUILDER_DIR/config.yaml" | head -n 1 | sed -E "s/activeOrg:[[:space:]]*['\"]?([^'\"]+)['\"]?/\1/" | tr -d '\r')
fi

# ----------------------------------------------------
# 📌 Step 1: Select Target Client
# ----------------------------------------------------
TARGET_CLIENT=""

if [ -n "$CLIENT_ARG" ]; then
    for c in "${CLIENTS[@]}"; do
        if [ "$c" == "$CLIENT_ARG" ]; then
            TARGET_CLIENT="$c"
            break
        fi
    done
    if [ -z "$TARGET_CLIENT" ]; then
        TARGET_CLIENT="$CLIENT_ARG"
    fi
else
    if [ ${#CLIENTS[@]} -gt 0 ]; then
        echo -e "\n${CYAN}📋 Step 1: Select Target Project / Client:${NC}"
        for i in "${!CLIENTS[@]}"; do
            client_key="${CLIENTS[$i]}"
            client_display_name="$(tr '[:lower:]' '[:upper:]' <<< ${client_key:0:1})${client_key:1}"
            if [ "$client_key" == "$DEFAULT_CLIENT" ]; then
                echo -e "  [${GREEN}$((i+1))${NC}] 🌟 ${GREEN}$client_display_name (Active)${NC}"
            else
                echo -e "  [${CYAN}$((i+1))${NC}] 📁 $client_display_name"
            fi
        done

        read -p "👉 Your Selection (Press Enter for active default: ${DEFAULT_CLIENT:-1}): " CLIENT_CHOICE

        if [ -z "$CLIENT_CHOICE" ]; then
            TARGET_CLIENT="${DEFAULT_CLIENT:-${CLIENTS[0]}}"
        elif [[ "$CLIENT_CHOICE" =~ ^[0-9]+$ ]] && [ "$CLIENT_CHOICE" -ge 1 ] && [ "$CLIENT_CHOICE" -le "${#CLIENTS[@]}" ]; then
            TARGET_CLIENT="${CLIENTS[$((CLIENT_CHOICE-1))]}"
        else
            TARGET_CLIENT="$CLIENT_CHOICE"
        fi
    fi
fi

if [ -z "$TARGET_CLIENT" ]; then
    TARGET_CLIENT="${DEFAULT_CLIENT:-tantest}"
fi

# ----------------------------------------------------
# 📌 Step 2: Fetch Organizations for Target Client
# ----------------------------------------------------
ORGS_RAW=$(python3 "$BUILDER_DIR/configure.py" "$TARGET_CLIENT" --list-orgs 2>/dev/null)
ORG_IDS=()
ORG_DEFAULTS=()
ORG_TITLES=()
ORG_SITES=()
ORG_DNAMES=()

DEFAULT_TEST_ORG_ID=""

while IFS='|' read -r o_id is_def title site dname; do
    if [ -n "$o_id" ]; then
        ORG_IDS+=("$o_id")
        ORG_DEFAULTS+=("$is_def")
        ORG_TITLES+=("$title")
        ORG_SITES+=("$site")
        ORG_DNAMES+=("$dname")
        if [ "$is_def" == "1" ] && [ -z "$DEFAULT_TEST_ORG_ID" ]; then
            DEFAULT_TEST_ORG_ID="$o_id"
        fi
    fi
done <<< "$ORGS_RAW"

if [ -z "$DEFAULT_TEST_ORG_ID" ] && [ ${#ORG_IDS[@]} -gt 0 ]; then
    DEFAULT_TEST_ORG_ID="${ORG_IDS[0]}"
fi

SELECTED_ORGS=()

if [ -n "$ORG_ARG" ]; then
    if [ "$ORG_ARG" == "all" ] || [ "$ORG_ARG" == "ALL" ] || [ "$ORG_ARG" == "*" ]; then
        SELECTED_ORGS=("${ORG_IDS[@]}")
    else
        CLEAN_ORGS_INPUT=$(echo "$ORG_ARG" | tr ',' ' ')
        for token in $CLEAN_ORGS_INPUT; do
            if [[ "$token" =~ ^[0-9]+-[0-9]+$ ]]; then
                start_num=$(echo "$token" | cut -d'-' -f1)
                end_num=$(echo "$token" | cut -d'-' -f2)
                for (( idx=start_num; idx<=end_num; idx++ )); do
                    if [ $idx -ge 1 ] && [ $idx -le ${#ORG_IDS[@]} ]; then
                        SELECTED_ORGS+=("${ORG_IDS[$((idx-1))]}")
                    fi
                done
            elif [[ "$token" =~ ^[0-9]+$ ]]; then
                if [ $token -ge 1 ] && [ $token -le ${#ORG_IDS[@]} ]; then
                    SELECTED_ORGS+=("${ORG_IDS[$((token-1))]}")
                fi
            else
                for o in "${ORG_IDS[@]}"; do
                    if [ "$o" == "$token" ]; then
                        SELECTED_ORGS+=("$o")
                        break
                    fi
                done
            fi
        done
    fi
else
    # Interactive Selection if not passed via CLI
    if [ ${#ORG_IDS[@]} -gt 1 ]; then
        echo -e "\n${CYAN}🏢 Step 2: Select Target Organization for [${BOLD}${TARGET_CLIENT}${CYAN}]:${NC}"
        for i in "${!ORG_IDS[@]}"; do
            o_id="${ORG_IDS[$i]}"
            title="${ORG_TITLES[$i]}"
            site="${ORG_SITES[$i]}"
            is_def="${ORG_DEFAULTS[$i]}"

            badge=""
            if [ "$is_def" == "1" ]; then
                badge=" ${YELLOW}[🧪 Default Test]${NC}"
            fi
            if [ "$o_id" == "$DEFAULT_ORG" ]; then
                badge="$badge ${GREEN}[Active]${NC}"
            fi

            echo -e "  [${CYAN}$((i+1))${NC}] 🏷️  ${BOLD}$title${NC} (ID: \`$o_id\` | Site: \`$site\`)$badge"
        done
        echo -e "  [${PURPLE}A${NC}] 🚀 ${BOLD}All Organizations (Bulk Deploy / Config)${NC}"

        read -p "👉 Your Selection (Press Enter for default test: ${DEFAULT_TEST_ORG_ID}): " ORG_CHOICE

        if [ -z "$ORG_CHOICE" ]; then
            SELECTED_ORGS+=("$DEFAULT_TEST_ORG_ID")
        elif [ "$ORG_CHOICE" == "a" ] || [ "$ORG_CHOICE" == "A" ] || [ "$ORG_CHOICE" == "all" ]; then
            SELECTED_ORGS=("${ORG_IDS[@]}")
        elif [[ "$ORG_CHOICE" =~ ^[0-9]+$ ]] && [ "$ORG_CHOICE" -ge 1 ] && [ "$ORG_CHOICE" -le ${#ORG_IDS[@]} ]; then
            SELECTED_ORGS+=("${ORG_IDS[$((ORG_CHOICE-1))]}")
        else
            SELECTED_ORGS+=("$ORG_CHOICE")
        fi
    else
        SELECTED_ORGS+=("${ORG_IDS[0]:-default}")
    fi
fi

# ----------------------------------------------------
# 📌 Step 3: Select Action
# ----------------------------------------------------
if [ -z "$ACTION" ]; then
    echo -e "\n${YELLOW}📝 Step 3: Select Action for Target Org(s) [${BOLD}${SELECTED_ORGS[*]}${YELLOW}]:${NC}"
    echo -e "  [${CYAN}1${NC}] 💻 Run Locally (Next.js Dev Server)"
    echo -e "  [${CYAN}2${NC}] 🚀 Build & Deploy to Firebase Hosting"
    echo -e "  [${CYAN}3${NC}] ⚙️  Configure Only (No Build)"
    echo -e "  [${CYAN}4${NC}] 📦 Build Locally Only"
    read -p "👉 Option Number: " ACTION_INDEX
    case $ACTION_INDEX in
        1) ACTION="run";;
        2) ACTION="deploy";;
        3) ACTION="config";;
        4) ACTION="build";;
        *) echo -e "${RED}❌ Invalid option${NC}"; exit 1;;
    esac
fi

# ----------------------------------------------------
# 📌 Step 4: Execute Action (Single or Bulk Loop)
# ----------------------------------------------------
TOTAL_ORGS=${#SELECTED_ORGS[@]}

# If action is 'run' (Dev server), configure the first selected org and launch dev server
if [ "$ACTION" == "run" ]; then
    TARGET_ORG="${SELECTED_ORGS[0]}"
    echo -e "\n${CYAN}⚙️  Configuring environment for [${TARGET_CLIENT} -> ${TARGET_ORG}]...${NC}"
    python3 "$BUILDER_DIR/configure.py" "$TARGET_CLIENT" "$TARGET_ORG" "$ACTION"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Configuration failed!${NC}"
        exit 1
    fi
    echo -e "\n${GREEN}🖥️  Starting Next.js Dev Server on http://localhost:3000 ...${NC}"
    cd "$WEBSITE_DIR"
    npm run dev
    exit 0
fi

# If action is 'config', run configure.py for all selected orgs
if [ "$ACTION" == "config" ]; then
    for (( i=0; i<TOTAL_ORGS; i++ )); do
        ORG="${SELECTED_ORGS[$i]}"
        echo -e "\n${CYAN}======================================================${NC}"
        echo -e "${GREEN}⚙️  [$((i+1))/$TOTAL_ORGS] Configuring Org: ${BOLD}${ORG}${NC} (Client: ${TARGET_CLIENT})"
        echo -e "${CYAN}======================================================${NC}"
        python3 "$BUILDER_DIR/configure.py" "$TARGET_CLIENT" "$ORG" "$ACTION"
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Configuration failed for Org [$ORG]!${NC}"
            exit 1
        fi
    done
    echo -e "\n${GREEN}${BOLD}🎉 Configurations successfully generated for: [${SELECTED_ORGS[*]}]!${NC}\n"
    exit 0
fi

# If action is 'build' (Build locally)
if [ "$ACTION" == "build" ]; then
    for (( i=0; i<TOTAL_ORGS; i++ )); do
        ORG="${SELECTED_ORGS[$i]}"
        echo -e "\n${CYAN}======================================================${NC}"
        echo -e "${GREEN}📦 [$((i+1))/$TOTAL_ORGS] Building Next.js for Org: ${BOLD}${ORG}${NC} (Client: ${TARGET_CLIENT})"
        echo -e "${CYAN}======================================================${NC}"
        python3 "$BUILDER_DIR/configure.py" "$TARGET_CLIENT" "$ORG" "$ACTION"
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Configuration failed for Org [$ORG]!${NC}"
            exit 1
        fi
        
        cd "$WEBSITE_DIR"
        rm -rf .next
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Build failed for Org [$ORG]!${NC}"
            exit 1
        fi
    done
    echo -e "\n${GREEN}${BOLD}🎉 Build completed successfully for: [${SELECTED_ORGS[*]}]!${NC}\n"
    exit 0
fi

# If action is 'deploy' (Build & Deploy to Firebase Hosting)
if [ "$ACTION" == "deploy" ]; then
    SUCCESSFUL_DEPLOYS=()
    FAILED_DEPLOYS=()

    for (( i=0; i<TOTAL_ORGS; i++ )); do
        ORG="${SELECTED_ORGS[$i]}"
        echo -e "\n${CYAN}======================================================${NC}"
        echo -e "${GREEN}🚀 [$((i+1))/$TOTAL_ORGS] Deploying Org: ${BOLD}${ORG}${NC} (Client: ${TARGET_CLIENT})"
        echo -e "${CYAN}======================================================${NC}"

        # 1. Configure
        python3 "$BUILDER_DIR/configure.py" "$TARGET_CLIENT" "$ORG" "$ACTION"
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Configuration failed for Org [$ORG]!${NC}"
            FAILED_DEPLOYS+=("$ORG")
            continue
        fi

        # 2. Extract Firebase Project and Hosting Site
        FIREBASE_PROJECT=$(grep -E "\"default\":" "$WEBSITE_DIR/.firebaserc" 2>/dev/null | head -n 1 | sed -E 's/.*"default":[[:space:]]*"([^"]+)".*/\1/' | tr -d '\r')
        HOSTING_SITE=$(grep -E "\"site\":" "$WEBSITE_DIR/firebase.json" 2>/dev/null | head -n 1 | sed -E 's/.*"site":[[:space:]]*"([^"]+)".*/\1/' | tr -d '\r')

        echo -e "${YELLOW}📦 Cleaning cache and building Next.js bundle for Org: \`${ORG}\`...${NC}"
        cd "$WEBSITE_DIR"
        rm -rf .next
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Next.js build failed for Org [$ORG]!${NC}"
            FAILED_DEPLOYS+=("$ORG")
            continue
        fi

        echo -e "${YELLOW}☁️  Uploading to Firebase Hosting Site: \`${HOSTING_SITE}\` (Project: \`${FIREBASE_PROJECT}\`)...${NC}"
        if [ -n "$FIREBASE_PROJECT" ]; then
            firebase use "$FIREBASE_PROJECT" 2>/dev/null || true
            firebase deploy --only hosting --project "$FIREBASE_PROJECT"
        else
            firebase deploy --only hosting
        fi

        if [ $? -eq 0 ]; then
            SUCCESSFUL_DEPLOYS+=("$ORG (Site: $HOSTING_SITE)")
        else
            echo -e "${RED}❌ Firebase deploy failed for Org [$ORG]!${NC}"
            FAILED_DEPLOYS+=("$ORG")
        fi
    done

    echo -e "\n${CYAN}======================================================${NC}"
    echo -e "${BLUE}${BOLD}   📊 Deployment Summary                             ${NC}"
    echo -e "${CYAN}======================================================${NC}"
    if [ ${#SUCCESSFUL_DEPLOYS[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ Successfully Deployed (${#SUCCESSFUL_DEPLOYS[@]}):${NC}"
        for s in "${SUCCESSFUL_DEPLOYS[@]}"; do
            echo -e "   - $s"
        done
    fi
    if [ ${#FAILED_DEPLOYS[@]} -gt 0 ]; then
        echo -e "${RED}❌ Failed Deploys (${#FAILED_DEPLOYS[@]}):${NC}"
        for f in "${FAILED_DEPLOYS[@]}"; do
            echo -e "   - $f"
        done
    fi
    echo ""
fi
