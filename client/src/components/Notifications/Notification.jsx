import { notification } from 'antd';
import { useEffect } from 'react';

const Notification = (
    { message, placement = 'top', duration = 2 }
) => {
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (message) {
            api.info({
                message,
                placement,
                duration,
            });
        }
    }, [message, placement, api]);

    return (
        <>
            {contextHolder}
        </>
    );
};

export default Notification;