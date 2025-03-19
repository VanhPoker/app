import { message, notification } from "antd";
import type { NotificationArgsProps } from 'antd';
import { AxiosError } from "axios";
type NotificationPlacement = NotificationArgsProps['placement'];
export class HelpService {
  static successMessage(arg0: string) {
    throw new Error("Method not implemented.");
  }

  configNotification = {
    duration: 3,
    className: 'toast-notification',
  }

  configMessage = {
    className: 'toast-message',
  };

  defaultPostionToast: NotificationPlacement = 'topRight';

  constructor() { }

  successNotification(message: string, placement: NotificationPlacement = this.defaultPostionToast) {
    notification.success({
      message: message,
      duration: this.configNotification.duration,
      className: this.configNotification.className,
      placement: placement,
    });
  }

  errorNotification(message: string, placement: NotificationPlacement = this.defaultPostionToast) {
    notification.error({
      message: message,
      duration: this.configNotification.duration,
      className: this.configNotification.className,
      placement: placement,
    });
  }

  successMessage(content: string) {
    message.open({
      type: 'success',
      content: content,
      className: this.configMessage.className,
    });
  }

  errorMessage(content: string) {
    message.open({
      type: 'error',
      content: content,
      className: this.configMessage.className,
    });
  }

  waringMessage(content: string, duration: number, onClose: any) {
    message.open({
      type: 'warning',
      content: content,
      className: this.configMessage.className,
      onClose: onClose || function () { },
      duration: duration || 5
    });
  }

  setTitleTabBrower(title: string) {
    const element = document.getElementById("title-tab-brower");
    if (element) {
      element.innerHTML = title;
    }
  }

  loadingProcess() {
    const key = 'loaingProcess';
    message.open({
      key,
      type: 'loading',
      content: 'Đang chờ phản hồi',
    });
  }

  closeProcess() {
    const key = 'loaingProcess';
    message.destroy(key);
  }

  showMessageErrorAPI(error: any) {
    const messageError = error?.response?.data?.message;
    const code = error?.response?.status;
    const constructor = error?.response?.data?.constructor;
    if (constructor == ArrayBuffer) {
      let messageBody = '';
      let responseBodyBuffer = (error as AxiosError)?.response?.data as ArrayBuffer;
      let data = JSON.parse(new TextDecoder("utf-8").decode(responseBodyBuffer));
      messageBody = data.message || messageBody;
      message.error(messageBody);
      return;
    }
    if (typeof messageError === 'string') {
      if (messageError !== '') {
        message.error(messageError);
      } else {
        if (code === 400) {
          message.error('Hệ thống bị gián đoạn vui lòng quay lại sau.');
        }
        if (code === 403) {
          message.error('Thời gian đăng nhập hết hạn.');
        }
        if (code === 500) {
          message.error('Hệ thống bị gián đoạn vui lòng quay lại sau.');
        }
      }
    } else {
      message.error(error.response.data.message.message);
    }
  }
}

