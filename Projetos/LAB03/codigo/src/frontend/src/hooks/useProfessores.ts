import { useState, useEffect, useCallback } from 'react'
import { professoresAPI, ProfessorDTO } from '../lib/api'

export function useProfessor(id: number | undefined) {
  const [data, setData] = useState<ProfessorDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfessor = useCallback(async () => {
    if (!id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const professor = await professoresAPI.buscarPorId(id)
      setData(professor)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar professor'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProfessor()
  }, [fetchProfessor])

  return { data, isLoading, error, refetch: fetchProfessor }
}
