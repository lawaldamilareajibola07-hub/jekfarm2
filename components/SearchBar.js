import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Add this import

export default function SearchBarComponent({ onSearch }) {
  const navigation = useNavigation(); // Add this
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (searchText.trim() !== "") {
      // Navigate to UserProduct screen with search query
      navigation.navigate('UserProduct', { 
        searchQuery: searchText.trim()
      });
      
      // Clear search text after navigation
      setSearchText("");
      
      // Blur input on mobile
      if (inputRef.current && Platform.OS !== "web") {
        inputRef.current.blur();
      }
    }
  };

  const handleClear = () => {
    setSearchText("");
    // Focus back on input after clearing
    if (inputRef.current && Platform.OS === "web") {
      inputRef.current.focus();
    }
  };

  // Apply web-specific focus styles
  useEffect(() => {
    if (Platform.OS === "web" && inputRef.current) {
      const input = inputRef.current;
      
      // Apply styles directly to DOM element
      const applyStyles = () => {
        if (input) {
          input.style.outline = "none";
          input.style.boxShadow = "none";
          input.style.border = "none";
          input.style.backgroundColor = "transparent";
          input.style.width = "100%";
        }
      };

      // Apply styles immediately
      applyStyles();

      // Re-apply styles on focus
      const handleFocus = (e) => {
        applyStyles();
        // Prevent default focus behavior
        e.target.style.outline = "none";
        e.target.style.boxShadow = "none";
      };

      // Re-apply styles on any mutation (React Native Web might override)
      const observer = new MutationObserver(applyStyles);
      observer.observe(input, { attributes: true, attributeFilter: ['style'] });

      input.addEventListener("focus", handleFocus);
      
      return () => {
        observer.disconnect();
        input.removeEventListener("focus", handleFocus);
      };
    }
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={styles.iconButton}
          activeOpacity={0.7}
          // Web-specific props to prevent focus outline
          {...(Platform.OS === "web" ? {
            onMouseDown: (e) => e.preventDefault(), // Prevent focus on click
          } : {})}
        >
          <Ionicons name="search-outline" size={20} color="#757575" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={[
            styles.searchInput,
            Platform.OS === "web" && styles.webTextInput
          ]}
          placeholder="Search for a product"
          placeholderTextColor="#757575"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="never"
          // Web-specific props
          {...(Platform.OS === "web" ? {
            autoFocus: false,
            onFocus: (e) => {
              // Remove focus outline
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
            },
            onMouseDown: (e) => {
              // Prevent any default behaviors that might steal focus
              e.stopPropagation();
            },
          } : {})}
        />

        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.iconButton}
            activeOpacity={0.7}
            // Web-specific props to prevent focus outline
            {...(Platform.OS === "web" ? {
              onMouseDown: (e) => e.preventDefault(), // Prevent focus on click
            } : {})}
          >
            <Ionicons name="close-circle-outline" size={24} color="#757575" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginHorizontal: 8,
    paddingVertical: Platform.OS === "ios" ? 4 : 8,
    borderWidth: 0,
  
    outlineWidth: 0,
    backgroundColor: "transparent",
    // Ensure proper display on web
    ...Platform.select({
      web: {
        display: "block",
        minWidth: 0,
      },
    }),
  },
  webTextInput: {
    // Additional web styles if needed
  },
  iconButton: {
    padding: 4,
    backgroundColor: "transparent",
    borderRadius: 20,
    // Remove focus outline on web
    ...Platform.select({
      web: {
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        ":focus": {
          outline: "none",
        },
      },
    }),
  },
});

// Add global styles for web to prevent all focus outlines
if (Platform.OS === "web" && typeof document !== "undefined") {
  // Check if style already exists
  if (!document.querySelector("#remove-focus-outlines")) {
    const style = document.createElement("style");
    style.id = "remove-focus-outlines";
    style.textContent = `
      /* Remove focus outlines globally */
      *:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Specifically for React Native Web elements */
      input[data-focusable="true"]:focus,
      button[data-focusable="true"]:focus,
      [data-focusable="true"]:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Prevent blue highlight on tap for mobile web */
      * {
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}