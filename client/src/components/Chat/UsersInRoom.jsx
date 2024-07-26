import chatAppImage from '../../assets/chat-app.jpg';

const UsersInRoom = ({
    users
}) => {

    return (
        <div className='bg-blue-500 w-[20%] rounded-l-lg'>
            <img src={chatAppImage} height={'200px'} alt="chat-app"
                className='w-[3.7rem] mx-auto' />

            <hr className='w-full border-b' />

            <h1 className='text-center text-xl p-2'>
                Connected Users
            </h1>
            <ul>
                {users.map((user, index) => (
                    <div key={index} className='flex items-center ml-5'>
                        <i className="fa-solid fa-circle text-[10px] text-green-500 pr-1"></i>
                        <span className='truncate max-w-[120px]'>{user}</span>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default UsersInRoom;