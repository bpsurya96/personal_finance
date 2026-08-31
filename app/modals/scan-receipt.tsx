import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { extractReceiptData } from '../../src/lib/ai';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

export default function ScanReceiptModal() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const addExpense = useExpenseStore((state) => state.addExpense);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.processButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setPhoto(data.base64);
    }
  };

  const processReceipt = async () => {
    if (!photo) return;
    setIsProcessing(true);
    try {
      const receiptData = await extractReceiptData(photo);
      if (receiptData) {
        await addExpense({
          amount: receiptData.amount,
          description: receiptData.merchant,
          date: receiptData.date || new Date().toISOString(),
          category: 'others', 
          type: 'expense',
          addedBy: 'husband',
        } as any, 'default-family'); 
        alert(`Receipt added: ${receiptData.merchant} for ₹${receiptData.amount}`);
        router.back();
      } else {
        alert('Could not parse receipt. Try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error processing receipt.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.preview} />
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryAction} />
            <Text style={styles.processingText}>AI is analyzing receipt...</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setPhoto(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.processButton} onPress={processReceipt}>
              <Text style={styles.buttonText}>Extract Data</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={32} color="white" />
          </TouchableOpacity>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  message: { textAlign: 'center', color: '#fff', paddingBottom: 10, fontSize: 16 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeButton: { alignSelf: 'flex-start', marginTop: 40 },
  captureContainer: { alignSelf: 'center', marginBottom: 40 },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  preview: { flex: 1, resizeMode: 'contain' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 30, backgroundColor: '#111' },
  retakeButton: { padding: 15, backgroundColor: '#475569', borderRadius: 8 },
  processButton: { padding: 15, backgroundColor: '#3b82f6', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  processingContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  processingText: { color: '#fff', marginTop: 16, fontSize: 16 }
});
