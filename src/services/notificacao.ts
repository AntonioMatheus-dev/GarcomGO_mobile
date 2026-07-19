import { Platform } from 'react-native';

let NotificationsModule: any = null;

async function carregarModulo() {
  if (NotificationsModule) return NotificationsModule;
  try {
    NotificationsModule = await import('expo-notifications');
  } catch {
    console.warn('[Notificação] expo-notifications não disponível (Expo Go)');
    return null;
  }

  NotificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  return NotificationsModule;
}

export async function solicitarPermissao() {
  const mod = await carregarModulo();
  if (!mod) return false;

  const { status: existingStatus } = await mod.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await mod.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notificação] Permissão negada');
    return false;
  }

  if (Platform.OS === 'android') {
    await mod.setNotificationChannelAsync('default', {
      name: 'Pedidos',
      importance: mod.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#337acc',
    });
  }

  return true;
}

export async function dispararNotificacao(
  titulo: string,
  corpo: string,
  dados?: Record<string, string>,
) {
  const mod = await carregarModulo();
  if (!mod) return;

  await mod.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      data: dados || {},
      sound: true,
    },
    trigger: null,
  });
}

export async function ouvirRespostaNotificacao(
  aoTocar: (dados: Record<string, string>) => void,
) {
  const mod = await carregarModulo();
  if (!mod) return null;

  const subscription = mod.addNotificationResponseReceivedListener(
    (response: any) => {
      const data = response.notification.request.content.data as Record<string, string>;
      aoTocar(data);
    },
  );
  return subscription;
}
