import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";
import { getFAQs } from "../../../api/commerce/help";
import { Ionicons } from "@expo/vector-icons";

export default function FAQScreen() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await getFAQs();
      const faqsWithOpen = res.data.data.map((faq) => ({ ...faq, open: false }));
      setFaqs(faqsWithOpen);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = (index) => {
    setFaqs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, open: !item.open } : item))
    );
  };

  const filteredFaqs = faqs.filter(
    (faq) => faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <TouchableOpacity onPress={() => toggleOpen(index)} style={styles.header}>
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons name={item.open ? "chevron-up" : "chevron-down"} size={20} />
      </TouchableOpacity>
      {item.open && <Text style={styles.answer}>{item.answer}</Text>}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!faqs.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No FAQs available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search questions..."
        value={search}
        onChangeText={(text) => setSearch(text)}
      />
      <FlatList
        data={filteredFaqs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  question: { fontWeight: "700", fontSize: 16 },
  answer: { marginTop: 10, fontSize: 14, color: "#555" },
});