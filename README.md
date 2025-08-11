## 🎯 About The Project

**SpiderGate** is a lightweight, extensible Node.js server designed to act as a central gateway for various API-driven automations. Instead of deploying multiple standalone services, SpiderGate provides a core foundation that can dynamically load independent modules, which we call **"orbs."**

This architecture simplifies deployment, centralizes configuration, and allows for clean, compartmentalized development of individual API functionalities.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/arvobowen/spider-gate/main/assets/logo.png" alt="SpiderGate Logo" width="150"/>
</div>

<h1 align="center">SpiderGate API Server</h1>

<div align="center">
  The core API gateway for handling automated workflows and integrations. It serves as the central hub for various API modules (orbs) designed to use with SpiderGate.
</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-blue?style=for-the-badge)

</div>

---

## ✨ Features

* **Modular Architecture:** Easily add new API endpoints by creating self-contained "orbs."
* **Centralized Server:** A single, stable entry point for all your API traffic.
* **Static Landing Page:** A professional landing page to represent the server's status.
* **Scalable:** Designed to grow with your needs, from one orb to many.

---

## ♻️ Update existing installs with npm package manager

If you have already installed SpiderGate previously and just need to update to the latest version then use this command to update to a specific version.  There is not a way to auto update to the latest version so you need to specify a specific version.  As an example, if the latest version was 1.0.5 you could use the following command to update.

```bash
sudo npm install spider-gate@1.0.5
```

---

## ⚡ Quick setup with npm package manager

The fastest way to get this service up and running would be to use the npm package manager. Follow these quick steps to deploy and setup SpiderGate on a dedicated server.

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* npm
* **PM2:** A production process manager for Node.js. It keeps your server running 24/7 and will automatically restart it if it crashes. Install it globally with the command:
    ```bash
    sudo npm install pm2 -g
    ```

### Installation

1.  Best security practices would suggest you create a new user dedicated to the SpiderGate process with limited access to system resources.
    ```bash
    # Create the user without a password
    sudo adduser --disabled-password spidergate
    # Create the user's group
    sudo groupadd spidergate
    # Add the user to the new group
    sudo usermod -a -G spidergate spidergate
    ```

2.  Set up the dedicated server directory:
    ```bash
    # Create the main server directory
    sudo mkdir -p /home/spidergate/server
    # Set the correct ownership
    sudo chown -R spidergate:spidergate /home/spidergate/server
    # Switch to the new user and navigate to the directory
    sudo -i -u spidergate
    cd ~/server
    ```

3.  Initialize the project and create the `package.json` file:
    ```bash
    npm init -y
    ```

4.  Install the latest version of SpiderGate:
    ```bash
    npm install spider-gate
    ```

5.  Setup the PM2 service to manage and auto-run SpiderGate:
    ```bash
    # Start the server using the installed package's main file
    pm2 start ./node_modules/spider-gate/index.js --name spider-gate
    # Save the process so it will restart on server reboots
    pm2 save
    ```

---

## 🚀 Getting Started (for Developers)

To get a local copy up and running for development, follow these simple steps.

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* npm

### Installation

1.  Clone the repo:
    ```bash
    git clone [https://github.com/arvobowen/spider-gate.git](https://github.com/arvobowen/spider-gate.git)
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

---

## 🏛️ Architecture

SpiderGate is designed with a core and plugin architecture.

* **The Gateway (`spider-gate`):** This is the core project. Its only job is to start the web server, serve the landing page, and load any available orbs.
* **The Orbs (e.g., `sg-announcer-gt`):** These are separate, self-contained Node.js projects that export an Express Router. Each orb defines its own API endpoints and logic. The gateway dynamically mounts these routers at their specified paths.

This keeps each piece of functionality completely decoupled and easy to maintain.