import './App.css'
import Chat from './components/Chat'
import ConnectedUsers from './components/ConnectedUsers';

function App() {
    return (
        <>
            <div className='flex justify-center gap-10 pt-20'>
                <ConnectedUsers />
                <Chat />
            </div>
        </>
    )
}

export default App;
