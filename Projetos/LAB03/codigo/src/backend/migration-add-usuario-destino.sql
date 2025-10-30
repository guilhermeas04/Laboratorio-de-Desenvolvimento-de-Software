-- Script para renomear a coluna empresa_id para usuario_destino_id na tabela transacao
-- Execute este script no banco de dados PostgreSQL

-- 1. Remover a constraint de foreign key existente de empresa_id (se existir)
ALTER TABLE transacao 
DROP CONSTRAINT IF EXISTS fk_transacao_empresa;

-- 2. Renomear a coluna empresa_id para usuario_destino_id
ALTER TABLE transacao 
RENAME COLUMN empresa_id TO usuario_destino_id;

-- 3. Adicionar a nova constraint de foreign key para usuario_destino_id
ALTER TABLE transacao 
ADD CONSTRAINT fk_transacao_usuario_destino 
FOREIGN KEY (usuario_destino_id) REFERENCES usuario(id);

-- 4. Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_transacao_usuario_destino 
ON transacao(usuario_destino_id);

-- 5. Atualizar comentários sobre as colunas
COMMENT ON COLUMN transacao.usuario_id IS 'Usuário que originou a transação (remetente)';
COMMENT ON COLUMN transacao.usuario_destino_id IS 'Usuário que recebeu a transação (destinatário)';

-- 6. Exibir estrutura atualizada da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'transacao'
ORDER BY ordinal_position;
