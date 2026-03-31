"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const transactions = [
  {
    id: "1",
    month: "Jun",
    data: [
      {
        id: "t1",
        title: "Wallet Topup",
        date: "Dec 23rd 2024 | 11:30PM",
        amount: 14550,
        status: "Completed",
        type: "credit",
        icon: "wallet",
      },
      {
        id: "t2",
        title: "Wallet Topup",
        date: "Dec 23rd 2024 | 11:25PM",
        amount: 3000,
        status: "Pending",
        type: "credit",
        icon: "wallet",
      },
      {
        id: "t3",
        title: "Money Sent",
        date: "Dec 23rd 2024 | 11:10PM",
        amount: -23290,
        status: "Completed",
        type: "debit",
        icon: "send",
      },
      {
        id: "t4",
        title: "Grocery Purchase",
        date: "Dec 23rd 2024 | 11:00PM",
        amount: -46211,
        status: "Completed",
        type: "debit",
        icon: "cart",
      },
    ],
  },
  {
    id: "2",
    month: "May",
    data: [
      {
        id: "t5",
        title: "Grocery Purchase",
        date: "Dec 23rd 2024 | 11:00PM",
        amount: -46211,
        status: "Completed",
        type: "debit",
        icon: "cart",
      },
    ],
  },
];

const TransactionItem = ({ item }) => (
  <View style={styles.transactionCard}>
    <View style={styles.row}>
      {/* Icon */}
      <View style={styles.iconBox}>
        <Ionicons
          name={item.icon}
          size={20}
          color="#22C55E"
          style={{ alignSelf: "center" }}
        />
      </View>

      {/* Title & Date */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      {/* Amount & Status */}
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            styles.amount,
            item.type === "credit" ? styles.credit : styles.debit,
          ]}
        >
          {item.type === "credit" ? "+" : ""}
          {item.amount.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.status,
            item.status === "Pending" && { color: "#F59E0B" },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  </View>
);

const FilterModal = ({
  visible,
  onClose,
  selectedFilters,
  setSelectedFilters,
  onApply,
}) => {
  const filters = [
    { label: "Grocery Purchase", icon: "cart" },
    { label: "Money Sent", icon: "send" },
    { label: "Wallet Topup", icon: "wallet" },
  ];

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Transactions</Text>

          {filters.map(({ label, icon }) => (
            <TouchableOpacity
              key={label}
              style={styles.checkboxRow}
              onPress={() => toggleFilter(label)}
            >
              {/* Icon left */}
              <View style={styles.filterIconBox}>
                <Ionicons name={icon} size={18} color="#22C55E" />
              </View>

              {/* Label */}
              <Text style={styles.checkboxText}>{label}</Text>

              {/* Circle checkbox right */}
              <View
                style={[
                  styles.roundCheckbox,
                  selectedFilters.includes(label) &&
                    styles.roundCheckboxChecked,
                ]}
              >
                {selectedFilters.includes(label) && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <Text style={styles.applyText}>Proceed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TransactionHistory = ({ navigation }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);

  const applyFilter = () => {
    if (selectedFilters.length === 0) {
      setFilteredTransactions(transactions);
    } else {
      const newData = transactions.map((month) => ({
        ...month,
        data: month.data.filter((tx) =>
          selectedFilters.some((f) => tx.title.includes(f))
        ),
      }));
      setFilteredTransactions(newData.filter((m) => m.data.length > 0));
    }
    setFilterVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#22C55E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Transaction History</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="calendar-outline" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterVisible(true)}>
            <Ionicons name="filter-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <View style={styles.monthContainer}>
              <Text style={styles.month}>{item.month}</Text>
              <View style={styles.monthUnderline} />
            </View>
            {item.data.map((t) => (
              <TransactionItem key={t.id} item={t} />
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        onApply={applyFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    marginLeft: 12,
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  monthContainer: {
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  monthUnderline: {
    width: 30,
    height: 3,
    backgroundColor: "#22C55E",
    borderRadius: 2,
  },
  transactionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  date: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "600" },
  credit: { color: "#22C55E" },
  debit: { color: "#EF4444" },
  status: { fontSize: 12, marginTop: 2, color: "#22C55E" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 4,
    borderTopColor: "#22C55E",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterIconBox: {
    backgroundColor: "#ECFDF5",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  checkboxText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },
  roundCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  roundCheckboxChecked: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  applyButton: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  applyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#22C55E",
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#22C55E",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TransactionHistory;
