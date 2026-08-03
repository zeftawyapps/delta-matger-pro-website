#!/bin/bash

# 🎨 Modern high-intensity colors for maximum readability on all terminals
RED='\033[0;91m'      # High-intensity Red
GREEN='\033[0;92m'    # High-intensity Green
BLUE='\033[0;94m'     # High-intensity Blue (extremely readable)
CYAN='\033[0;96m'     # High-intensity Cyan
YELLOW='\033[0;93m'   # High-intensity Yellow
PURPLE='\033[0;95m'   # High-intensity Purple
BOLD='\033[1m'
NC='\033[0m'          # No Color

echo -e "${CYAN}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}   🚀 Delta Matger Pro - Next.js Website Setup        ${NC}"
echo -e "${CYAN}${BOLD}======================================================${NC}"

WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILDER_DIR="$WEBSITE_DIR/project_builder"

# 1. مسح وتحديد العملاء المتاحين ديناميكياً من مجلد clients
CLIENTS=()
for file in "$BUILDER_DIR"/clients/*.yaml; do
    if [ -f "$file" ]; then
        client_filename=$(basename "$file")
        client_name="${client_filename%.yaml}"
        CLIENTS+=("$client_name")
    fi
done

CLIENT_ARG=""
ACTION=""

if [ "$1" == "config" ] || [ "$1" == "run" ] || [ "$1" == "build" ] || [ "$1" == "deploy" ]; then
    ACTION="$1"
else
    if [ -n "$1" ]; then
        CLIENT_ARG="$1"
    fi
    if [ "$2" == "config" ] || [ "$2" == "run" ] || [ "$2" == "build" ] || [ "$2" == "deploy" ]; then
        ACTION="$2"
    fi
fi

DEFAULT_CLIENT=""
if [ -f "$BUILDER_DIR/config.yaml" ]; then
    DEFAULT_CLIENT=$(grep -E "^activeClient:" "$BUILDER_DIR/config.yaml" | sed -E "s/activeClient:[[:space:]]*['\"]?([^'\"]+)['\"]?/\1/")
fi

SELECTED_CLIENTS=()

if [ -n "$CLIENT_ARG" ]; then
    if [ "$CLIENT_ARG" == "all" ] || [ "$CLIENT_ARG" == "ALL" ] || [ "$CLIENT_ARG" == "*" ]; then
        SELECTED_CLIENTS=("${CLIENTS[@]}")
    else
        CLEAN_INPUT=$(echo "$CLIENT_ARG" | tr ',' ' ')
        for token in $CLEAN_INPUT; do
            if [[ "$token" =~ ^[0-9]+-[0-9]+$ ]]; then
                start_num=$(echo "$token" | cut -d'-' -f1)
                end_num=$(echo "$token" | cut -d'-' -f2)
                for (( idx=start_num; idx<=end_num; idx++ )); do
                    if [ $idx -ge 1 ] && [ $idx -le ${#CLIENTS[@]} ]; then
                        SELECTED_CLIENTS+=("${CLIENTS[$((idx-1))]}")
                    fi
                done
            elif [[ "$token" =~ ^[0-9]+$ ]]; then
                if [ $token -ge 1 ] && [ $token -le ${#CLIENTS[@]} ]; then
                    SELECTED_CLIENTS+=("${CLIENTS[$((token-1))]}")
                fi
            else
                for c in "${CLIENTS[@]}"; do
                    if [ "$c" == "$token" ]; then
                        SELECTED_CLIENTS+=("$c")
                        break
                    fi
                done
            fi
        done
    fi
else
    if [ ${#CLIENTS[@]} -gt 0 ]; then
        echo -e "\n${CYAN}📋 Select Active Client(s) to Configure:${NC}"
        echo -e "  [${PURPLE}all${NC}] 🌐 Select ALL Clients"
        for i in "${!CLIENTS[@]}"; do
            client_key="${CLIENTS[$i]}"
            client_display_name="$(tr '[:lower:]' '[:upper:]' <<< ${client_key:0:1})${client_key:1}"
            if [ "$client_key" == "$DEFAULT_CLIENT" ]; then
                echo -e "  [${GREEN}$((i+1))${NC}] 🌟 ${GREEN}$client_display_name (Active)${NC}"
            else
                echo -e "  [${CYAN}$((i+1))${NC}] 📁 $client_display_name"
            fi
        done

        echo -e "\n${YELLOW}💡 Selection Guidelines / طريقة الاختيار:${NC}"
        echo -e "   • Single client (عميل واحد)     : Type ${GREEN}1${NC} or ${GREEN}4${NC} (or Press Enter for active default: ${GREEN}${DEFAULT_CLIENT}${NC})"
        echo -e "   • Multiple clients (عدة عملاء)  : Type ${GREEN}1,2,4${NC} or ${GREEN}1 2 4${NC} or range ${GREEN}1-3${NC}"
        echo -e "   • All clients (جميع العملاء)   : Type ${PURPLE}all${NC} or ${PURPLE}*${NC}"
        read -p "👉 Your Selection: " CLIENT_CHOICE

        if [ -z "$CLIENT_CHOICE" ]; then
            if [ -n "$DEFAULT_CLIENT" ]; then
                SELECTED_CLIENTS+=("$DEFAULT_CLIENT")
            fi
        elif [ "$CLIENT_CHOICE" == "all" ] || [ "$CLIENT_CHOICE" == "ALL" ] || [ "$CLIENT_CHOICE" == "*" ]; then
            SELECTED_CLIENTS=("${CLIENTS[@]}")
        else
            CLEAN_INPUT=$(echo "$CLIENT_CHOICE" | tr ',' ' ')
            for token in $CLEAN_INPUT; do
                if [[ "$token" =~ ^[0-9]+-[0-9]+$ ]]; then
                    start_num=$(echo "$token" | cut -d'-' -f1)
                    end_num=$(echo "$token" | cut -d'-' -f2)
                    for (( idx=start_num; idx<=end_num; idx++ )); do
                        if [ $idx -ge 1 ] && [ $idx -le ${#CLIENTS[@]} ]; then
                            SELECTED_CLIENTS+=("${CLIENTS[$((idx-1))]}")
                        fi
                    done
                elif [[ "$token" =~ ^[0-9]+$ ]]; then
                    if [ $token -ge 1 ] && [ $token -le ${#CLIENTS[@]} ]; then
                        SELECTED_CLIENTS+=("${CLIENTS[$((token-1))]}")
                    fi
                else
                    for c in "${CLIENTS[@]}"; do
                        if [ "$c" == "$token" ]; then
                            SELECTED_CLIENTS+=("$c")
                            break
                        fi
                    done
                fi
            done
        fi
    fi
fi

if [ ${#SELECTED_CLIENTS[@]} -eq 0 ] && [ -n "$DEFAULT_CLIENT" ]; then
    SELECTED_CLIENTS+=("$DEFAULT_CLIENT")
fi

UNIQUE_CLIENTS=()
for c in "${SELECTED_CLIENTS[@]}"; do
    if [[ ! " ${UNIQUE_CLIENTS[*]} " =~ " ${c} " ]]; then
        UNIQUE_CLIENTS+=("$c")
    fi
done
SELECTED_CLIENTS=("${UNIQUE_CLIENTS[@]}")

if [ ${#SELECTED_CLIENTS[@]} -eq 0 ]; then
    echo -e "${RED}❌ Error: No client specified or selected! Exiting.${NC}"
    exit 1
fi

if [ -z "$ACTION" ]; then
    echo -e "\n${YELLOW}📝 Select action for target client(s) [${BOLD}${SELECTED_CLIENTS[*]}${YELLOW}]:${NC}"
    echo -e "  [${CYAN}1${NC}] 💻 Run Locally (Next.js Dev Server)"
    echo -e "  [${CYAN}2${NC}] 🚀 Build & Deploy to Firebase"
    echo -e "  [${CYAN}3${NC}] ⚙️  Configure Only (No Build)"
    echo -e "  [${CYAN}4${NC}] 📦 Build Locally Only"
    read -p "Option Number: " ACTION_INDEX
    case $ACTION_INDEX in
        1) ACTION="run";;
        2) ACTION="deploy";;
        3) ACTION="config";;
        4) ACTION="build";;
        *) echo -e "${RED}❌ Invalid option${NC}"; exit 1;;
    esac
fi

TOTAL_CLIENTS=${#SELECTED_CLIENTS[@]}
COUNT=0

for CLIENT in "${SELECTED_CLIENTS[@]}"; do
    COUNT=$((COUNT+1))
    echo -e "\n${CYAN}======================================================${NC}"
    echo -e "${GREEN}⚙️  [$COUNT/$TOTAL_CLIENTS] Target Client: ${BOLD}${CLIENT}${NC}"
    echo -e "${CYAN}🏃 Action: ${BOLD}${ACTION}${NC}"
    echo -e "${CYAN}======================================================${NC}"

    python3 "$BUILDER_DIR/configure.py" "$CLIENT" "$ACTION"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Configuration failed for [$CLIENT]!${NC}"
        exit 1
    fi
done

if [ "$ACTION" == "config" ]; then
    echo -e "\n${GREEN}${BOLD}🎉 Configurations successfully generated for target client(s): [${SELECTED_CLIENTS[*]}]!${NC}\n"
    exit 0
fi

if [ "$ACTION" == "run" ]; then
    echo -e "\n${GREEN}🖥️  Starting Next.js Dev Server...${NC}"
    cd "$WEBSITE_DIR"
    npm run dev
elif [ "$ACTION" == "build" ]; then
    echo -e "\n${BLUE}📦 Building Next.js Web Application...${NC}"
    cd "$WEBSITE_DIR"
    npm run build
elif [ "$ACTION" == "deploy" ]; then
    LAST_CLIENT="${SELECTED_CLIENTS[${#SELECTED_CLIENTS[@]}-1]}"
    FIREBASE_PROJECT=$(grep -E "^[[:space:]]*project:" "$BUILDER_DIR/clients/$LAST_CLIENT.yaml" 2>/dev/null | head -n 1 | sed -E "s/.*project:[[:space:]]*['\"]?([^'\"]+)['\"]?/\1/" | tr -d '\r')
    if [ -z "$FIREBASE_PROJECT" ]; then
        FIREBASE_PROJECT=$(grep -E "\"default\":" "$WEBSITE_DIR/.firebaserc" 2>/dev/null | head -n 1 | sed -E 's/.*"default":[[:space:]]*"([^"]+)".*/\1/' | tr -d '\r')
    fi

    echo -e "\n${YELLOW}🚀 Deploying Website to Firebase (Project: ${BOLD}${FIREBASE_PROJECT}${YELLOW})...${NC}"
    cd "$WEBSITE_DIR"
    npm run build
    if [ -n "$FIREBASE_PROJECT" ]; then
        firebase use "$FIREBASE_PROJECT" 2>/dev/null || true
        firebase deploy --only hosting --project "$FIREBASE_PROJECT"
    else
        firebase deploy --only hosting
    fi
fi
