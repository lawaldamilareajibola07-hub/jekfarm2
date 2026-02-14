import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ListItem from './ListItem';

const Section = ({ title, items }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <ListItem key={index} label={item.label} onPress={item.onPress} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: -50,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    color: '#888',
  }
});

export default Section;
