import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getDisputeDetail } from "../../../api/commerce/disputes";

export default function DisputeDetailScreen({ route }) {
  const { disputeId } = route.params;
  const [dispute, setDispute] = useState(null);

  useEffect(() => {
    fetchDispute();
  }, []);

  const fetchDispute = async () => {
    try {
      const res = await getDisputeDetail(disputeId);
      setDispute(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const renderTimelineItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.timelineItem}>
      <Text style={styles.timelineRole}>{item.from}</Text>
      <Text style={styles.timelineMessage}>{item.message}</Text>
      {item.attachments?.map((att, i) => (
        <Text key={i} style={styles.attachment}>Attachment: {att.url}</Text>
      ))}
      <Text style={styles.timelineDate}>{new Date(item.created_at).toLocaleString()}</Text>
    </Animated.View>
  );

  if (!dispute) return <Text style={{ padding: 16 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.title}>Dispute #{dispute.id}</Text>
        <Text style={styles.order}>Order: {dispute.order_id}</Text>
        <Text style={styles.reason}>Reason: {dispute.reason}</Text>
        <Text style={styles.status}>Status: {dispute.status}</Text>
        <Text style={styles.date}>Submitted: {new Date(dispute.created_at).toLocaleString()}</Text>
      </View>

      <FlatList
        data={dispute.timeline}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderTimelineItem}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  summary: { marginBottom: 16, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  order: { fontSize: 14, marginBottom: 4 },
  reason: { fontSize: 14, marginBottom: 4 },
  status: { fontSize: 14, marginBottom: 4, fontWeight: "600", color: "#1a8917" },
  date: { fontSize: 12, color: "#555" },
  timelineItem: { marginBottom: 12, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 },
  timelineRole: { fontWeight: "700", marginBottom: 2 },
  timelineMessage: { marginBottom: 4 },
  attachment: { fontSize: 12, color: "#1a8917", marginBottom: 2 },
  timelineDate: { fontSize: 10, color: "#999", textAlign: "right" },
});