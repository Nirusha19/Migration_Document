#!/bin/bash

# GitHub Migration Documentation Tool - Installation Script
set -e

echo "🚀 GitHub Migration Documentation Tool - Installation"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_nodejs() {
    echo -e "${BLUE}Checking Node.js...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
        
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            echo -e "${RED}❌ Node.js 16+ required${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
}

install_deps() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

setup_env() {
    echo -e "${BLUE}Setting up environment...${NC}"
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Environment file created${NC}"
        echo -e "${YELLOW}📝 Please edit .env with your GitHub token${NC}"
    else
        echo -e "${YELLOW}⚠️ .env already exists${NC}"
    fi
}

main() {
    check_nodejs
    install_deps
    setup_env
    mkdir -p migration-docs
    
    echo ""
    echo -e "${GREEN}🎉 Installation completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Get GitHub token: https://github.com/settings/personal-access-tokens/tokens"
    echo "2. Edit .env file with your settings"
    echo "3. Run: npm start -- --interactive"
    echo ""
    echo "For help: npm start -- --help"
}

main
