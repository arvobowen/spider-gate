<div align="center">
  <img src="./assets/logo.png" alt="SpiderGate Logo" width="150"/>
</div>

<h1 align="center">SpiderGate API Server</h1>

<div align="center">
  The core API gateway for handling automated workflows and integrations. It serves as the central hub for various API modules (orbs).
</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-blue?style=for-the-badge)

</div>

---

## 🎯 About The Project

**SpiderGate** is a lightweight, extensible Node.js server designed to act as a central gateway for various API-driven automations. Instead of deploying multiple standalone services, SpiderGate provides a core foundation that can dynamically load independent modules, which we call **"orbs."**

This architecture simplifies deployment, centralizes configuration, and allows for clean, compartmentalized development of individual API functionalities.

---

## ✨ Features

* **Modular Architecture:** Easily add new API endpoints by creating self-contained "orbs."
* **Centralized Server:** A single, stable entry point for all your API traffic.
* **Static Landing Page:** A professional landing page to represent the server's status.
* **Scalable:** Designed to grow with your needs, from one orb to many.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

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