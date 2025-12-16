import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { colors, fontFamilies, spacing } from '@/constants/theme';
import { useCart, type CartItem } from '@/contexts/CartContext';
import { navigateToHome } from '@/lib/navigation';
import { submitQuoteRequest } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const isWeb = Platform.OS === 'web';
const CONTENT_PADDING = isWeb ? 48 : spacing.lg;
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function CartPage() {
  const { width: screenWidth } = useWindowDimensions();
  const { items, updateQuantity, removeItem, clearCart, totalItems } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmitQuote = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom et Email)');
      return;
    }
    setSubmitting(true);
    try {
      await submitQuoteRequest({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        message: formData.message,
        items: items.map((item) => ({ product_id: item.id, product_name: item.name, quantity: item.quantity })),
        status: 'pending',
      });
      Alert.alert('Succès', 'Votre demande de devis a été envoyée !');
      clearCart();
      setFormData({ name: '', email: '', phone: '', message: '' });
      navigateToHome();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image_url || DEFAULT_IMAGE }} style={styles.itemImage} contentFit="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
        <Ionicons name="trash-outline" size={22} color={colors.brandPrimary} />
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showBack={!isWeb} title={isWeb ? undefined : 'Panier'} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyText}>Parcourez notre catalogue pour ajouter des produits</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={navigateToHome}>
            <Text style={styles.emptyButtonText}>VOIR LE CATALOGUE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showBack={!isWeb} title={isWeb ? undefined : 'Panier'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Breadcrumb */}
          {isWeb && (
            <View style={styles.breadcrumb}>
              <TouchableOpacity onPress={navigateToHome} style={styles.breadcrumbItem}>
                <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.breadcrumbLink}>Accueil</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbSeparator}>›</Text>
              <Text style={styles.breadcrumbCurrent}>Panier</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Votre sélection</Text>
            <Text style={styles.pageSubtitle}>Remplissez le formulaire ci-dessous pour recevoir un devis personnalisé</Text>
          </View>

          {/* Layout principal */}
          <View style={styles.mainLayout}>
            {/* Colonne gauche - Produits */}
            <View style={styles.productsColumn}>
              <Text style={styles.sectionTitle}>Produits sélectionnés</Text>
              {items.map(renderCartItem)}
            </View>

            {/* Colonne droite - Formulaire */}
            <View style={styles.formColumn}>
              <Text style={styles.sectionTitle}>Demande de devis</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom complet *</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.name} 
                  onChangeText={(t) => setFormData({ ...formData, name: t })} 
                  placeholder="Votre nom complet"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.email} 
                  onChangeText={(t) => setFormData({ ...formData, email: t })} 
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.phone} 
                  onChangeText={(t) => setFormData({ ...formData, phone: t })} 
                  placeholder="06 12 34 56 78"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput 
                  style={[styles.input, styles.textarea]} 
                  value={formData.message} 
                  onChangeText={(t) => setFormData({ ...formData, message: t })} 
                  placeholder="Précisez votre événement, la date, le lieu..."
                  placeholderTextColor={colors.textMuted}
                  multiline 
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleSubmitQuote} 
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  
  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyTitle: { fontFamily: fontFamilies.display, fontSize: 24, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  emptyText: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  emptyButton: { backgroundColor: colors.textPrimary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 4 },
  emptyButtonText: { fontFamily: fontFamilies.body, fontWeight: '700', color: colors.textOnDark, letterSpacing: 1 },

  // Breadcrumb
  breadcrumb: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: CONTENT_PADDING, 
    paddingVertical: spacing.md, 
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbLink: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textSecondary },
  breadcrumbSeparator: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textMuted, marginHorizontal: 4 },
  breadcrumbCurrent: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },

  // Page header
  pageHeader: { 
    paddingHorizontal: CONTENT_PADDING, 
    paddingTop: isWeb ? spacing.xl : spacing.lg,
    paddingBottom: spacing.lg,
  },
  pageTitle: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 48 : 32, 
    color: colors.textPrimary, 
    marginBottom: spacing.sm,
  },
  pageSubtitle: { 
    fontFamily: fontFamilies.body, 
    fontSize: isWeb ? 16 : 14, 
    color: colors.textSecondary,
    lineHeight: isWeb ? 24 : 20,
  },

  // Main layout
  mainLayout: { 
    flexDirection: isWeb ? 'row' : 'column',
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: spacing.xxl,
    gap: isWeb ? spacing.xxl : spacing.xl,
  },

  // Products column
  productsColumn: { 
    flex: isWeb ? 1 : undefined,
    maxWidth: isWeb ? 600 : undefined,
  },
  sectionTitle: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 24 : 20, 
    color: colors.textPrimary, 
    marginBottom: spacing.lg,
  },
  cartItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: spacing.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.borderSubtle,
  },
  itemImage: { 
    width: isWeb ? 100 : 80, 
    height: isWeb ? 100 : 80, 
    borderRadius: 4,
  },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemName: { 
    fontFamily: fontFamilies.body, 
    fontSize: isWeb ? 16 : 14, 
    fontWeight: '500', 
    color: colors.textPrimary, 
    marginBottom: spacing.sm,
  },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: { 
    width: 32, 
    height: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: colors.borderSubtle,
  },
  qtyButtonText: { fontFamily: fontFamilies.body, fontSize: 18, color: colors.textPrimary },
  qtyText: { fontFamily: fontFamilies.body, paddingHorizontal: spacing.md, fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  removeButton: { padding: spacing.sm },

  // Form column
  formColumn: { 
    flex: isWeb ? 1 : undefined,
    maxWidth: isWeb ? 500 : undefined,
  },
  formGroup: { marginBottom: spacing.lg },
  label: { 
    fontFamily: fontFamilies.body, 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textPrimary, 
    marginBottom: spacing.xs,
  },
  input: { 
    fontFamily: fontFamilies.body, 
    borderWidth: 1, 
    borderColor: colors.borderSubtle, 
    borderRadius: 8, 
    paddingHorizontal: spacing.md, 
    paddingVertical: isWeb ? spacing.md : spacing.sm, 
    fontSize: 16, 
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  textarea: { 
    height: isWeb ? 120 : 100, 
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  submitButton: { 
    backgroundColor: colors.textPrimary, 
    paddingVertical: spacing.md, 
    alignItems: 'center',
    borderRadius: isWeb ? 30 : 4,
    marginTop: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { 
    fontFamily: fontFamilies.body, 
    fontSize: 16,
    fontWeight: '600', 
    color: colors.textOnDark,
  },
});
