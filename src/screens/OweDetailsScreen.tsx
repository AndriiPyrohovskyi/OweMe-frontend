import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { FullOwe, OweItem } from '../types/owes';
import { owesApi } from '../services/api/endpoints/owes';
import { walletApi } from '../services/api/endpoints/wallet';
import { StatusBadge } from '../components/StatusBadge';
import { OweParticipantCard } from '../components/OweParticipantCard';
import { DebtReturnCard } from '../components/DebtReturnCard';
import { TextInput } from '../components/TextInput';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useDebtReturn } from '../hooks/useDebtReturn';

interface OweDetailsScreenProps {
  oweId: number;
  onBack: () => void;
  onEdit: (oweItemId?: number) => void;
  onCreateReturn: (participantId: number) => void;
  onNavigateToUser?: (userId: number) => void;
  onNavigateToGroup?: (groupId: number) => void;
}

export const OweDetailsScreen: React.FC<OweDetailsScreenProps> = ({
  oweId,
  onBack,
  onEdit,
  onCreateReturn,
  onNavigateToUser,
  onNavigateToGroup,
}) => {
  const { user } = useAuth();
  const [owe, setOwe] = useState<FullOwe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOweDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await owesApi.getFullOwe(oweId);
      setOwe(response);
    } catch (err: any) {
      console.error('Error fetching owe details:', err);
      setError(err.response?.data?.message || 'Помилка завантаження деталей боргу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOweDetails();
  }, [oweId]);

  const isOwner = owe && user && owe.fromUser.id === user.id;

  const handleAcceptParticipant = async (participantId: number) => {
    try {
      setActionLoading(true);
      await owesApi.acceptOweParticipant(participantId);
      Alert.alert('Успіх', 'Борг прийнято');
      fetchOweDetails();
    } catch (err: any) {
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося прийняти борг');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineParticipant = async (participantId: number) => {
    try {
      setActionLoading(true);
      await owesApi.declineOweParticipant(participantId);
      Alert.alert('Успіх', 'Борг відхилено');
      fetchOweDetails();
    } catch (err: any) {
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося відхилити борг');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelParticipant = async (participantId: number) => {
    Alert.alert(
      'Підтвердження',
      'Ви впевнені, що хочете скасувати цей борг?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          onPress: async () => {
            try {
              setActionLoading(true);
              await owesApi.cancelOweParticipant(participantId);
              Alert.alert('Успіх', 'Борг скасовано');
              fetchOweDetails();
            } catch (err: any) {
              Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося скасувати борг');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteOwe = async () => {
    Alert.alert(
      'Підтвердження',
      'Ви впевнені, що хочете видалити цей борг?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await owesApi.deleteFullOwe(oweId);
              Alert.alert('Успіх', 'Борг видалено', [
                { text: 'OK', onPress: onBack }
              ]);
            } catch (err: any) {
              Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося видалити борг');
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderOweItem = (item: OweItem) => {
    const hasImages = item.imageUrls && item.imageUrls.length > 0;
    
    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[typography.h3, styles.itemName]}>{item.name}</Text>
            {item.description && (
              <Text style={[typography.secondary, styles.itemDescription]}>
                {item.description}
              </Text>
            )}
          </View>
          {isOwner && (
            <Button
              title="Редагувати"
              onPress={() => onEdit(item.id)}
              variant="yellow"
              padding={6}
              style={styles.editItemButton}
            />
          )}
        </View>

        {/* Images Gallery */}
        {hasImages && (
          <View style={styles.imagesSection}>
            <Text style={[typography.caption, styles.imagesSectionTitle]}>
              Фото ({item.imageUrls!.length}):
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
            >
              {item.imageUrls!.map((url: string, index: number) => (
                <Image 
                  key={index}
                  source={{ uri: url }} 
                  style={styles.itemImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[typography.main, styles.participantsTitle]}>
          Учасники ({item.oweParticipants.length}):
        </Text>

        {item.oweParticipants.map((participant) => {
          const isParticipantUser = user && participant.toUser?.id === user.id;
          const variant = isOwner ? 'sent' : 'received';
          const showActions = participant.status === 'Opened';

          // Визначаємо onPress для навігації
          let participantOnPress: (() => void) | undefined;
          
          // Пріоритет: Create return для accepted participant > Navigate to user/group
          if (participant.status === 'Accepted' && isParticipantUser) {
            participantOnPress = () => onCreateReturn(participant.id);
          } else if (participant.toUser && onNavigateToUser) {
            participantOnPress = () => onNavigateToUser(participant.toUser!.id);
          } else if (participant.group && onNavigateToGroup) {
            participantOnPress = () => onNavigateToGroup(participant.group!.id);
          }

          return (
            <OweParticipantCard
              key={participant.id}
              participant={participant}
              variant={variant}
              showActions={showActions && !actionLoading}
              onAccept={isParticipantUser ? () => handleAcceptParticipant(participant.id) : undefined}
              onDecline={isParticipantUser ? () => handleDeclineParticipant(participant.id) : undefined}
              onCancel={isOwner ? () => handleCancelParticipant(participant.id) : undefined}
              onPress={participantOnPress}
            />
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar title="Деталі боргу" onBack={onBack} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !owe) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar title="Деталі боргу" onBack={onBack} />
        <View style={styles.errorContainer}>
          <Text style={[typography.main, styles.errorText]}>
            {error || 'Борг не знайдено'}
          </Text>
          <Button
            title="Спробувати ще раз"
            onPress={fetchOweDetails}
            variant="purple"
            padding={12}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar 
        title="Деталі боргу" 
        onBack={onBack}
        rightContent={
          isOwner ? (
            <View style={styles.actionButtons}>
              <Button
                title="Редагувати"
                onPress={onEdit}
                variant="yellow"
                padding={8}
                style={styles.editButton}
              />
              <Button
                title="Видалити"
                onPress={handleDeleteOwe}
                variant="coral"
                padding={8}
              />
            </View>
          ) : undefined
        }
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {owe.image ? (
            <Image source={{ uri: owe.image }} style={styles.oweImage} />
          ) : (
            <View style={[styles.oweImage, styles.oweImagePlaceholder]}>
              <Icon name="homeIcon" size={32} />
            </View>
          )}
          <Text style={[typography.h1, styles.oweName]}>{owe.name}</Text>
          {owe.description && (
            <Text style={[typography.main, styles.oweDescription]}>
              {owe.description}
            </Text>
          )}
          <View style={styles.metaInfo}>
            <Text style={[typography.secondary, styles.metaText]}>
              від @{owe.fromUser.username}
            </Text>
            <Text style={[typography.secondary, styles.metaText]}>
              {new Date(owe.createdAt).toLocaleDateString('uk-UA')}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <Text style={[typography.h2, styles.sectionTitle]}>
            Пункти боргу ({owe.oweItems.length})
          </Text>
          {owe.oweItems.map(renderOweItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.coral,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    marginRight: 4,
  },
  header: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border_divider,
    alignItems: 'center',
  },
  oweImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  oweImagePlaceholder: {
    backgroundColor: colors.primary15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oweName: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  oweDescription: {
    color: colors.text70,
    textAlign: 'center',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  metaText: {
    color: colors.text70,
  },
  itemsContainer: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  editItemButton: {
    marginLeft: 8,
  },
  imagesSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  imagesSectionTitle: {
    color: colors.text70,
    marginBottom: 8,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    marginBottom: 2,
  },
  itemDescription: {
    color: colors.text70,
  },
  participantsTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default OweDetailsScreen;
