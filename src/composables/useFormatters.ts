import type { Transaction, TransactionType } from '@/types'

/**
 * Composable pour le formatage des données
 * Centralise toute la logique de formatage utilisée dans l'application
 */
export function useFormatters() {
  /**
   * Formate un montant en devise (EUR par défaut)
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Formate une date au format français
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  /**
   * Formate une date au format court (jour/mois)
   */
  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
    }).format(date)
  }

  /**
   * Formate le montant d'une transaction avec le signe approprié
   */
  const formatTransactionAmount = (transaction: Transaction): string => {
    const sign = transaction.type === 'INCOME' ? '+' : '-'
    return `${sign}${formatCurrency(transaction.amount)}`
  }

  /**
   * Calcule et formate un pourcentage
   */
  const getPercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0'
    return ((amount / total) * 100).toFixed(1)
  }

  /**
   * Retourne l'icône correspondant au type de transaction
   */
  const getTransactionIcon = (type: TransactionType): string => {
    const icons: Record<TransactionType, string> = {
      INCOME: '📈',
      EXPENSE: '📉',
      TRANSFER: '🔄'
    }
    return icons[type] || '💰'
  }

  return {
    formatCurrency,
    formatDate,
    formatDateShort,
    formatTransactionAmount,
    getPercentage,
    getTransactionIcon
  }
}
