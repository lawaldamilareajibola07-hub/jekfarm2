import React, { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, FlatList, RefreshControl, AppState } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [farmerId, setFarmerId] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)

  // API endpoints
  const DASHBOARD_API_URL = 'https://jekfarms.com.ng/farmerinterface/dashboard/overview.php'
  const TRANSACTIONS_API_URL = 'https://jekfarms.com.ng/farmerinterface/wallet/transactions.php'

  // farmer ID from AsyncStorage
  useEffect(() => {
    const getFarmerId = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('user')
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          console.log('Extracted farmer ID:', userData.id || userData.user_id || userData.farmer_id)

          let foundId = null
          if (userData.id) {
            foundId = userData.id.toString()
          } else if (userData.user_id) {
            foundId = userData.user_id.toString()
          } else if (userData.farmer_id) {
            foundId = userData.farmer_id.toString()
          }

          if (foundId) {
            setFarmerId(foundId)
            await fetchAllData(foundId)
          } else {
            setError('No farmer ID found in user data.')
            setLoading(false)
          }
        } else {
          setError('No user data found. Please login.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting farmer ID:', error)
        setError('Failed to load user information')
        setLoading(false)
      }
    }

    getFarmerId()
  }, [])

  // Refresh data when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && farmerId) {
        console.log('App came to foreground, refreshing data...')
        fetchAllData(farmerId)
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [farmerId])

  // Fetch ALL data - UPDATED with user_id parameter for dashboard
  const fetchAllData = async (userId) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching all data for user ID:', userId)

      // Add cache-busting timestamp
      const timestamp = Date.now()

      // FIXED: Include user_id in dashboard API call
      const dashboardUrl = `${DASHBOARD_API_URL}?user_id=${userId}&_=${timestamp}`
      console.log('Fetching dashboard:', dashboardUrl)

      let dashboardResponse = await fetch(dashboardUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })

      console.log('Dashboard response status:', dashboardResponse.status)

      let dashboardText = await dashboardResponse.text()
      console.log('Dashboard raw response:', dashboardText)

      let dashboardJson
      try {
        dashboardJson = JSON.parse(dashboardText)
        console.log('Parsed dashboard data:', dashboardJson)
      } catch (parseError) {
        console.error('Failed to parse dashboard JSON')
        dashboardJson = null
      }

      // Fetch transactions with cache-busting
      const transactionsUrl = `${TRANSACTIONS_API_URL}?user_id=${userId}&_=${timestamp}`
      console.log('Fetching transactions separately:', transactionsUrl)

      let transactionsResponse = await fetch(transactionsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })

      console.log('Transactions response status:', transactionsResponse.status)

      let transactionsText = await transactionsResponse.text()
      console.log('Transactions raw response:', transactionsText)

      let transactionsJson
      try {
        transactionsJson = JSON.parse(transactionsText)
        console.log('Parsed transactions data:', transactionsJson)
      } catch (parseError) {
        console.error('Failed to parse transactions JSON')
        transactionsJson = null
      }

      // Process dashboard data if available
      let dashboardSuccess = false
      if (dashboardJson && dashboardJson.status === 'success' && dashboardJson.data) {
        const newDashboardData = dashboardJson.data.overview || {
          sales: "0.00",
          revenue: "0.00",
          returns: "0.00",
          complete_orders: "0",
          total_customers: 0,
          new_customers: 0
        }

        console.log('Setting fresh dashboard data:', newDashboardData)
        setDashboardData(newDashboardData)
        dashboardSuccess = true

        // Use transactions from dashboard if available
        if (dashboardJson.data.transactions) {
          setTransactions(dashboardJson.data.transactions)
        }
      } else if (dashboardJson && dashboardJson.status === 'error') {
        console.log('Dashboard error:', dashboardJson.message)
        if (dashboardJson.message.includes('user_id')) {
          console.log('Dashboard API requires user_id parameter')
        }
      }

      // Process transactions separately if not already set
      if (transactionsJson && transactionsJson.status === 'success') {
        const txns = transactionsJson.data?.transactions || transactionsJson.transactions || []
        console.log('Setting fresh transactions:', txns.length)
        setTransactions(txns)
      }

      // If dashboard fetch failed, try alternative approach
      if (!dashboardSuccess) {
        console.log('Dashboard fetch failed, trying to calculate from transactions...')
        await calculateDashboardFromTransactions(userId, transactionsJson)
      }

      // Update last refresh time
      setLastUpdateTime(new Date())

      // Clear any previous errors
      setError(null)

    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data: ' + error.message)

      // Don't reset data on error if we already have data
      if (!dashboardData) {
        setDashboardData({
          sales: "0.00",
          revenue: "0.00",
          returns: "0.00",
          complete_orders: "0",
          total_customers: 0,
          new_customers: 0
        })
      }
      if (transactions.length === 0) {
        setTransactions([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard metrics from transactions if API fails
  const calculateDashboardFromTransactions = async (userId, transactionsJson) => {
    try {
      if (!transactionsJson || transactionsJson.status !== 'success') {
        console.log('No transaction data to calculate from')
        return
      }

      const txns = transactionsJson.data?.transactions || transactionsJson.transactions || []

      // Calculate metrics from transactions
      let totalRevenue = 0
      let totalSales = 0
      let completedOrders = new Set()

      txns.forEach(txn => {
        if (txn.status && txn.status.toLowerCase() === 'completed') {
          // Sum all completed transactions
          const amount = parseFloat(txn.amount) || 0
          totalRevenue += amount

          // Count items if available
          const items = txn.items_count || 1
          totalSales += items

          // Track unique orders
          if (txn.order_id) {
            completedOrders.add(txn.order_id)
          }
        }
      })

      // Update dashboard data with calculated values
      const calculatedData = {
        sales: totalSales.toFixed(2),
        revenue: totalRevenue.toFixed(2),
        returns: "0.00", // Can't calculate from transactions
        complete_orders: completedOrders.size.toString(),
        total_customers: 0, // Can't calculate from transactions
        new_customers: 0
      }

      console.log('Calculated dashboard from transactions:', calculatedData)
      setDashboardData(calculatedData)

    } catch (error) {
      console.error('Error calculating dashboard:', error)
    }
  }

  // Refresh all data - with force update
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (farmerId) {
        await fetchAllData(farmerId)
      }
    } catch (error) {
      console.error('Error refreshing:', error)
      Alert.alert('Refresh Error', 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // Force refresh dashboard data (call this after transactions)
  const refreshDashboard = useCallback(async () => {
    if (!farmerId) return

    console.log('Force refreshing dashboard data...')

    try {
      const timestamp = Date.now()
      const dashboardUrl = `${DASHBOARD_API_URL}?user_id=${farmerId}&_=${timestamp}&force=true`

      const response = await fetch(dashboardUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success' && data.data && data.data.overview) {
          setDashboardData(data.data.overview)
          setLastUpdateTime(new Date())
          console.log('Dashboard updated successfully')
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    }
  }, [farmerId])

  // Listen for transaction updates (you can call this from other components)
  useEffect(() => {
    // This is a global event listener that you can trigger from other components
    const handleTransactionUpdate = () => {
      console.log('Transaction update detected, refreshing dashboard...')
      refreshDashboard()
    }

    // You can also set up an event emitter or use context for this
    // For now, we'll refresh every 30 seconds as a fallback
    const intervalId = setInterval(() => {
      if (farmerId) {
        console.log('Periodic dashboard refresh...')
        refreshDashboard()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId)
  }, [farmerId, refreshDashboard])

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) {
      return '₦0'
    }

    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return '₦0'
    }

    return `₦${numAmount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Format number for display (for sales, returns, etc.)
  const formatNumber = (value) => {
    if (!value && value !== 0) {
      return '0'
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(numValue)) {
      return '0'
    }

    // Check if it has decimal places
    if (numValue % 1 === 0) {
      return numValue.toLocaleString('en-NG')
    } else {
      return numValue.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (e) {
      return dateString
    }
  }

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return ''
    }
  }

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdateTime) return 'Never'

    const now = new Date()
    const diffMs = now - lastUpdateTime
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`

    return lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get transaction status color
  const getStatusColor = (status) => {
    if (!status) return '#6b7280'

    switch (status.toLowerCase()) {
      case 'completed':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  // Get transaction type info
  const getTransactionTypeInfo = (type, description = '') => {
    if (!type && description.toLowerCase().includes('received from order')) {
      return {
        icon: 'arrow-down-circle',
        color: '#10b981',
        label: 'Sale'
      }
    }

    if (!type) return { icon: 'swap-horizontal', color: '#6b7280', label: 'Transaction' }

    switch (type.toLowerCase()) {
      case 'credit':
        return {
          icon: 'arrow-down-circle',
          color: '#10b981',
          label: 'Sale'
        }
      case 'debit':
        return {
          icon: 'arrow-up-circle',
          color: '#ef4444',
          label: 'Payment'
        }
      default:
        if (description.toLowerCase().includes('received')) {
          return {
            icon: 'arrow-down-circle',
            color: '#10b981',
            label: 'Sale'
          }
        }
        return { icon: 'swap-horizontal', color: '#6b7280', label: 'Transaction' }
    }
  }

  // Render transaction item
  const renderTransactionItem = ({ item, index }) => {
    const typeInfo = getTransactionTypeInfo(item.transaction_type, item.description)
    const isMoneyIn = typeInfo.label === 'Sale'

    return (
      <View style={styles.transactionCard} key={item.transaction_id || index}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionType}>
            <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
            <Text style={[styles.transactionTypeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
          <Text style={[
            styles.transactionAmount,
            isMoneyIn ? styles.creditAmount : styles.debitAmount
          ]}>
            {isMoneyIn ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || 'No description available'}
          </Text>

          <View style={styles.transactionMeta}>
            <Text style={styles.transactionId}>
              ID: {item.transaction_id || `TXN-${index}`}
            </Text>

            {item.items_count > 0 && (
              <View style={styles.itemsCountContainer}>
                <Ionicons name="cube-outline" size={12} color="#6b7280" />
                <Text style={styles.itemsCount}>{item.items_count} item{item.items_count > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>

          <View style={styles.transactionFooter}>
            <View style={styles.transactionDate}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.transactionDateText}>
                {formatDate(item.transaction_date)}
              </Text>
              <Text style={styles.transactionTimeText}>
                {formatTime(item.transaction_date)}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status || 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // Render transactions section
  const renderTransactionsSection = () => {
    return (
      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          {transactions.length > 0 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                Alert.alert('Transactions', `You have ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`)
              }}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#37b63dff" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#37b63dff" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : transactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {transactions.slice(0, 5).map((item, index) =>
              renderTransactionItem({ item, index })
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={50} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your transaction history will appear here once you receive payments
            </Text>
          </View>
        )}
      </View>
    )
  }

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#37b63dff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  if (error && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="alert-circle" size={50} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Use dashboardData or defaults
  const overviewData = dashboardData || {
    sales: "0.00",
    revenue: "0.00",
    returns: "0.00",
    complete_orders: "0",
    total_customers: 0,
    new_customers: 0
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#37b63dff']}
        />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Overview</Text>
          {lastUpdateTime && (
            <Text style={styles.lastUpdateText}>
              Updated {formatLastUpdate()}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#37b63dff" />
        </TouchableOpacity>
      </View>

      {/* Overview Header */}
      <View style={styles.overviewHeader}>
        <View style={styles.filterContainer}>
          <View style={styles.yearContainer}>
            <Text style={styles.showText}>Show:</Text>
            <Text style={styles.yearText}>This year</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
          <View style={styles.downloadIconContainer}>
            <View style={styles.downloadIcon}>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
            </View>
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <LinearGradient
          colors={["#ecfdf5", "#d1fae5"]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Sales</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#10b981" }]}>
              <Ionicons name="cart-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>
            {formatNumber(overviewData.sales)}
          </Text>
          <Text style={styles.cardSubtext}>Total items sold</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#eff6ff", "#dbeafe"]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Revenue</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#3b82f6" }]}>
              <Ionicons name="cash-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>
            {formatCurrency(overviewData.revenue)}
          </Text>
          <Text style={styles.cardSubtext}>Total earnings</Text>
        </LinearGradient>
      </View>

      <View style={styles.kpiContainer}>
        <LinearGradient
          colors={["#fffaf0", "#ffedd5"]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Returns</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#f59e0b" }]}>
              <Ionicons name="refresh-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>
            {formatNumber(overviewData.returns)}
          </Text>
          <Text style={styles.cardSubtext}>Items returned</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#fef2f2", "#fee2e2"]}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Orders</Text>
            <View style={[styles.cardIcon, { backgroundColor: "#ef4444" }]}>
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.cardValue}>
            {formatNumber(overviewData.complete_orders)}
          </Text>
          <Text style={styles.cardSubtext}>Completed orders</Text>
        </LinearGradient>
      </View>

      {/* Additional Stats Row */}
      <View style={styles.additionalStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Customers</Text>
          <Text style={styles.statValue}>
            {overviewData.total_customers?.toLocaleString() || '0'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>New Customers</Text>
          <Text style={styles.statValue}>
            {overviewData.new_customers?.toLocaleString() || '0'}
          </Text>
        </View>
      </View>

      {/* Transactions Section */}
      {renderTransactionsSection()}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  )
}

export default DashboardOverview

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  overviewHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showText: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 6
  },
  yearContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  yearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginRight: 6
  },
  downloadIconContainer: {
    flex: 1,
    alignItems: "flex-end"
  },
  downloadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16
  },
  card: {
    width: "48%",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "800",
    color: '#111827',
    letterSpacing: -0.5,
  },
  cardSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  additionalStats: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '100%',
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: '#10B981',
    marginRight: 4,
    fontWeight: '600',
  },
  transactionsList: {
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  creditAmount: {
    color: '#10b981',
  },
  debitAmount: {
    color: '#ef4444',
  },
  transactionDetails: {
    marginTop: 4,
  },
  transactionDescription: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  transactionDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    marginRight: 8,
  },
  transactionTimeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#37b63dff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },


  bottomSpacer: {
    height: 100,
  },
})