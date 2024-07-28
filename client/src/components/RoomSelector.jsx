import { useNavigate } from 'react-router-dom';

const RoomSelector = () => {
    const navigate = useNavigate();

    const handleSelectRoom = (room) => {
        navigate(`/chat/${room}`);
    };

    return (
        <div className='w-1/4 max-sm:w-1/2 max-lg:w-1/3'>
            <h1 className='text-2xl text-white text-center font-bold pb-1'>
                Select Room
            </h1>

            <div className='flex flex-col mx-auto w-3/4 max-md:w-full'>
                <button
                    className='text-white text-center border-2 p-5 m-2'
                    onClick={() => handleSelectRoom('general')}>
                    General
                </button>
                <button
                    className='text-white text-center border-2 p-5 m-2'
                    onClick={() => handleSelectRoom('room1')}>
                    Room 1
                </button>
                <button
                    className='text-white text-center border-2 p-5 m-2'
                    onClick={() => handleSelectRoom('room2')}>
                    Room 2
                </button>
            </div>
        </div>
    );
};

export default RoomSelector;
