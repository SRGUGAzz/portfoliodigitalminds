#!/bin/sh
echo "Iniciando servidor..."
NODE_ENV=production node dist/index.js || {
  echo "Falha no dist/index.js, tentando entrypoint.cjs..."
  node entrypoint.cjs || {
    echo "Falha no entrypoint.cjs, tentando entrypoint.mjs..."
    node entrypoint.mjs || {
      echo "Falha no entrypoint.mjs, tentando start-simple.js..."
      node start-simple.js || {
        echo "Todas as tentativas falharam."
        exit 1
      }
    }
  }
}
