FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 THINKMATE_DATA_DIR=/data THINKMATE_SECURE_COOKIE=true
COPY --chown=node:node package.json server.js app.js login.js index.html login.html styles.css theme.css login.css ./
COPY --chown=node:node assets ./assets
RUN mkdir -p /data && chown node:node /data && chmod 700 /data
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4173/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
