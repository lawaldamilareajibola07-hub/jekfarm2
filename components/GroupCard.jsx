import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const GroupCard = ({ group, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(group)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {group.group_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{group.group_name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {group.group_description}
        </Text>
        <Text style={styles.members}>
          {group.member_count} members • {group.user_role}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "gray",
  },
  members: {
    fontSize: 12,
    color: "gray",
  },
});

export default GroupCard;
