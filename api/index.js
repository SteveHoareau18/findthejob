/**
 * Point d'entrée Vercel Functions (Serverless & WebSockets)
 * Exporte l'instance du serveur HTTP pour permettre à Vercel de gérer
 * les connexions HTTP et les upgrades WebSockets (Fluid Compute).
 */
const server = require('../index');

module.exports = server;
