import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Animated, {
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";

const BankSelectorModal = ({
  visible,
  onClose,
  banks = [],
  onSelectBank,
}) => {
  const [search, setSearch] = useState("");
  const [recentBanks, setRecentBanks] = useState([]);

  /* Instant Search Optimization */
  const filteredBanks = useMemo(() => {
    if (!search) return banks;

    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, banks]);

  const handleSelectBank = (bank) => {
    onSelectBank(bank);

    setRecentBanks((prev) => {
      const exists = prev.find((b) => b.code === bank.code);
      if (exists) return prev;

      return [bank, ...prev].slice(0, 3);
    });

    onClose();
  };

  const renderBank = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 20)}
    >
      <TouchableOpacity
        style={styles.bankItem}
        activeOpacity={0.7}
        onPress={() => handleSelectBank(item)}
      >
        <View style={styles.bankRow}>
          <View style={styles.bankLogo}>
            <Text style={styles.logoText}>
              {item.name.charAt(0)}
            </Text>
          </View>

          <Text style={styles.bankText}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.container}
        >
          <Text style={styles.title}>Select Bank</Text>

          {/* Search Input */}
          <TextInput
            placeholder="Search bank..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {/* Recent Banks */}
          {recentBanks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recent
              </Text>

              {recentBanks.map((bank, index) => (
                <TouchableOpacity
                  key={bank.code}
                  style={styles.bankItem}
                  onPress={() => handleSelectBank(bank)}
                >
                  <View style={styles.bankRow}>
                    <View style={styles.bankLogo}>
                      <Text style={styles.logoText}>
                        {bank.name.charAt(0)}
                      </Text>
                    </View>

                    <Text style={styles.bankText}>
                      {bank.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Bank List */}
          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item.code}
            renderItem={renderBank}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Text style={styles.closeText}>
              Close
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BankSelectorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#020617",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
  },

  searchInput: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 20,
  },

  section: {
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#94a3b8",
    marginBottom: 10,
    fontWeight: "600",
  },

  bankItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  bankRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  bankLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  logoText: {
    color: "#22c55e",
    fontWeight: "700",
  },

  bankText: {
    color: "#fff",
    fontSize: 16,
  },

  closeBtn: {
    marginTop: 15,
    padding: 16,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});