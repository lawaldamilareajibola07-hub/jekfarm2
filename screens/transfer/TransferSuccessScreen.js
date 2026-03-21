import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function TransferSuccessScreen({ route, navigation }) {

  const { data } = route.params;

  return (

    <View style={styles.container}>

      <Animated.Text entering={FadeInUp.duration(400)} style={styles.icon}>
        ✅
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(100)} style={styles.title}>
        Transfer Successful
      </Animated.Text>

      <Text style={styles.reference}>
        Ref: {data?.reference}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MainTabs")}
      >
        <Text style={styles.buttonText}>
          Done
        </Text>
      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0f172a",
    justifyContent:"center",
    alignItems:"center",
    padding:20
  },

  icon:{
    fontSize:70,
    marginBottom:20
  },

  title:{
    fontSize:26,
    color:"#22c55e",
    fontWeight:"700"
  },

  reference:{
    color:"#94a3b8",
    marginTop:10
  },

  button:{
    marginTop:30,
    backgroundColor:"#22c55e",
    padding:16,
    borderRadius:10,
    width:"70%",
    alignItems:"center"
  },

  buttonText:{
    color:"#0f172a",
    fontWeight:"700",
    fontSize:16
  }

});