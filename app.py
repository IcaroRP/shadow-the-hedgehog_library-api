from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Adicione esta linha

tabela = pd.read_csv('src/STH_Library.csv', delimiter=';', dtype=str)

# Consultar todas as rotas
@app.route('/rotas', methods=['GET'])
def obter_rotas():
    return jsonify(tabela.to_dict(orient='records'))

# Consultar uma rota específica
@app.route('/rotas/<int:id>', methods=['GET'])
def obter_rota(id):
    rota = tabela[tabela['id'] == str(id)]
    if not rota.empty:
        data = rota.iloc[0].to_dict()
        return jsonify(data)
    return jsonify({"erro": "Rota não encontrada"}), 404

if __name__ == '__main__':
    app.run()
