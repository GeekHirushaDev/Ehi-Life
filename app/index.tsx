import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ehipassako</Text>
      <Text style={styles.subtitle}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F5F7F5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C4C3B',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#4A7C59',
    marginBottom: 32
  },
  button: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
