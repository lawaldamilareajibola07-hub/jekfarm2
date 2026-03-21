import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { transferFunds } from "../../api/transfer";

export default function TransferPinScreen({ route, navigation }) {

  const { recipient, amount, currency, purpose } = route.params;

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmTransfer = async () => {

    if (pin.length !== 6) {
      setError("Enter a valid 6 digit PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await transferFunds({
        recipient,
        amount,
        currency,
        purpose,
        pin,
        confirm: true,
      });

      if (res.status === "success") {

        navigation.replace("TransferSuccess", {
          data: res.data
        });

      } else {

        setError(res.message || "Invalid PIN");

      }

    } catch (err) {

      setError("Transfer failed. Try again.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <View style={styles.container}>

      <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
        Enter Transaction PIN
      </Animated.Text>

      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="******"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
      />

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={confirmTransfer}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#0f172a"/>
          : <Text style={styles.buttonText}>Confirm</Text>
        }
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0f172a",
    padding:20,
    justifyContent:"center"
  },

  title:{
    color:"#fff",
    fontSize:24,
    fontWeight:"700",
    textAlign:"center",
    marginBottom:20
  },

  input:{
    backgroundColor:"#1e293b",
    padding:16,
    borderRadius:10,
    color:"#fff",
    fontSize:18,
    textAlign:"center",
    letterSpacing:10
  },

  button:{
    marginTop:25,
    backgroundColor:"#22c55e",
    padding:16,
    borderRadius:10,
    alignItems:"center"
  },

  buttonText:{
    fontWeight:"700",
    color:"#0f172a",
    fontSize:16
  },

  error:{
    color:"#ef4444",
    marginTop:10,
    textAlign:"center"
  }

});