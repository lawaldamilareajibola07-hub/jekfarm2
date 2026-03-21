import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ProductImageGalleryScreen({ route, navigation }) {
  const { images, initialIndex = 0 } = route.params;
  const [visible, setVisible] = useState(true);

  const imageUrls = images.map(img => ({ url: img.image_url }));

  return (
    <Modal visible={visible} transparent={true} onRequestClose={() => { setVisible(false); navigation.goBack(); }}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ImageViewer
          imageUrls={imageUrls}
          index={initialIndex}
          enableSwipeDown
          onSwipeDown={() => { setVisible(false); navigation.goBack(); }}
          renderIndicator={(currentIndex, allSize) => (
            <Text style={styles.indicator}>{currentIndex} / {allSize}</Text>
          )}
          saveToLocalByLongPress={false}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => { setVisible(false); navigation.goBack(); }}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 30,
    padding: 5,
  },
  indicator: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});