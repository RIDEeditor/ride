#!/bin/bash

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Install rvm
# Based on instructions from https://rvm.io/rvm/install
install_rvm() {
    echo -e "${YELLOW}Starting rvm install...${NC}"
    # Add rvm key to keyring
    # Use solution from https://stackoverflow.com/a/38362809
    gpg2 --keyserver $(getent hosts keys.gnupg.net | awk '{ print $1 }' | head -1) --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    # Install rvm, along with rails
    \curl -sSL https://get.rvm.io | bash -s stable --rails
}

install_rails() {
    echo -e "${YELLOW}Installing rails gem...${NC}"
}

# Check if ruby is installed and available
has_ruby() {
    ruby_path=$(which ruby)
}

# Check if rails is installed
has_rails() {
    rails_path=$(which rails)
}

# Load rvm
source_rvm() {
    export PATH="$PATH:$HOME/.rvm/bin" # Add RVM to PATH for scripting
    [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
}

ask() {
    read -p "${1} [y/n] " -r
    echo # move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        return $TRUE
    else
        return $FALSE
    fi
}

main() {
    source_rvm
    if ! has_ruby
    then
        echo -e "${RED}Ruby is required for this program${NC}"
        if ask "Do you want to install it now?"
        then
            install_rvm
            source_rvm
        else
            echo -e "${RED}Ruby must be installed in order to use this application${NC}"
            echo -e "${RED}Please install it and relaunch the application${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}Ruby is installed${NC}"
    fi

    if ! has_rails
    then
        echo -e "${RED}Ruby on Rails is required for this program${NC}"
        if ask "Do you want to install it now?"
        then
            install_rails
            source_rvm
        else
            echo -e "${RED}Ruby on Rails must be installed in order to use this application${NC}"
            echo -e "${RED}Please install it and relaunch the application${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}Rails is installed${NC}"
    fi

    # Run application
    echo -e "${GREEN}Starting application...${NC}"
    ./rails-editor
}

# Run script
main
