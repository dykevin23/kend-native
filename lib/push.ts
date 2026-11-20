import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * 앱 푸시 — 권한·토큰 (kend readme/todo/push-notification-plan.md "웹 ↔ native 브릿지 규약")
 *
 * 웹이 GET_PUSH_STATUS / REQUEST_PUSH_PERMISSION을 보내면 getPushState()의 결과를 그대로 응답한다.
 * 토큰 등록(DB 저장)은 웹이 사용자 세션으로 한다 — native는 토큰만 넘긴다.
 */

// 앱이 켜져 있을 때 받은 알림도 배너로 보여준다 (기본값은 표시 안 함)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushPermissionStatus = "granted" | "denied" | "undetermined";

export interface PushState {
  status: PushPermissionStatus;
  token?: string;
  platform: "ios" | "android";
}

const PROJECT_ID: string | undefined =
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

// Android 8+는 채널이 있어야 알림이 뜨고, 13+는 채널 생성 후에 권한 팝업을 띄울 수 있다
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "주문·배송 알림",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

function toStatus(
  permission: Notifications.NotificationPermissionsStatus
): PushPermissionStatus {
  if (permission.granted) return "granted";
  // iOS 임시 허용(provisional)도 알림은 받으므로 허용으로 본다
  if (
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  ) {
    return "granted";
  }
  // 다시 물을 수 있으면 아직 미결정 — iOS는 한 번 거부하면 canAskAgain=false
  if (permission.status === "undetermined" || permission.canAskAgain) {
    return "undetermined";
  }
  return "denied";
}

async function getToken(): Promise<string | undefined> {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    return data;
  } catch {
    // 시뮬레이터·네트워크 오류 등 — 권한 상태는 그대로 알려주고 토큰만 생략
    return undefined;
  }
}

/**
 * 현재 권한 상태 (+허용이면 토큰).
 * request=true이고 아직 미결정이면 OS 권한 팝업을 띄운다.
 */
export async function getPushState(request: boolean): Promise<PushState> {
  await ensureAndroidChannel();

  let permission = await Notifications.getPermissionsAsync();
  if (request && toStatus(permission) === "undetermined") {
    permission = await Notifications.requestPermissionsAsync();
  }

  const status = toStatus(permission);
  const platform = Platform.OS === "android" ? "android" : "ios";
  if (status !== "granted") return { status, platform };

  return { status, platform, token: await getToken() };
}

/** 알림 data.url → 앱 내 경로만 허용 ("/orders/…"). 외부 주소·이상한 값은 무시 */
export function notificationPath(
  response: Notifications.NotificationResponse | null | undefined
): string | null {
  const url = response?.notification.request.content.data?.url;
  if (typeof url !== "string") return null;
  return url.startsWith("/") && !url.startsWith("//") ? url : null;
}
