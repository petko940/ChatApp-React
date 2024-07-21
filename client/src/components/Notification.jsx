import { notification } from 'antd';
import { useEffect } from 'react';

const Notification = (
    { message, description, placement = 'top' }
) => {
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (message) {
            api.info({
                message,
                description,
                placement,
            });
        }
    }, [message, description, placement, api]);

    return (
        <>
            {contextHolder}
        </>
    );
};

export default Notification;