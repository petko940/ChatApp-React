const UsersInRoom = ({
    users
}) => {

    return (
        <div className='bg-blue-500 w-[30%]'>
            users
            <ul>
                {users.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
            </ul>
        </div>
    );
};

export default UsersInRoom;