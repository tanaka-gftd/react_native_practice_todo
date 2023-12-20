//ReactのHookを導入
import React, {useState} from "react";

//ReactNativeのコンポーネントを導入
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    FlatList,
} from "react-native";

//モーダル用
import Modal  from "react-native-modal";


const App = () => {

    //フォームに書き込まれた内容を保持
    const [taskName, setTaskName] = useState("");

    //登録されたタスクの保持用
    const [taskArray, setTaskArray] = useState([]);

    //タスクのエディット用
    const [editIndex, setEditIndex] = useState(-1);

    //削除確認用モーダルの表示非表示切り替え用
    const [showModal, setShowModal] = useState(false);

    //タスクを格納した配列から、削除対象となるインデックス
    const [deleteIndex, setDeleteIndex] = useState(0);


    //タスクの新規登録orタスク名の変更を保存
    const addTask = () => {
        //フォームにタスク名が入力されていれば、以下の処理を行う
        if(taskName){
            if(editIndex !== -1){
                //「editIndex !== -1」の場合、つまり、タスク名を変更中の場合なら、変更されたタスク名を保存し終了
                const updatedTasks = [...taskArray];
                updatedTasks[editIndex] = taskName;
                setTaskArray(updatedTasks);
                setEditIndex(-1);
            }else{
                //新規登録の場合は配列に追加
                setTaskArray([...taskArray, taskName]);
            }
            //処理後、フォーム欄を空欄にする
            setTaskName("");
        }
    };


    //タスク名の変更
    const editTask = (index) => { 
        const taskToEdit = taskArray[index]; 
        setTaskName(taskToEdit); //変更したいタスクの名前をフォームに表示させる
        setEditIndex(index); 
    }; 


    //削除確認用モーダルの表示
    const openDeleteModal = (index) => {
        setShowModal(true);
        setDeleteIndex(index);
    }


    //タスクの削除
    //taskArrayから指定されたインデックスの要素(タスク)を削除して、 setTaskArrayでセットし直す
    const deleteTask = (index) => { 
        const updatedTasks = [...taskArray]; 
        updatedTasks.splice(index, 1); 
        setTaskArray(updatedTasks);
        setShowModal(false);
    }; 


    //タスク削除の確認用モーダル
    const TaskModal = () => (
        <Modal visible={showModal}>
            <View style={styles.modalWindow}>
                <Text style={{fontSize: 16, marginBottom: 25, fontWeight: "bold"}}>
                    タスク名：{taskArray[deleteIndex]} を本当に削除しますか？
                </Text>
                
                <View>
                    <TouchableOpacity style={{justifyContent: "center", alignItems: "center"}}>
                        <Text 
                            style={{color: "red", fontSize: 16, marginBottom: 30}} 
                            onPress={() => deleteTask(deleteIndex)}
                        >
                            タスクを削除する
                        </Text>
                        <Text 
                            style={{fontSize: 16}} 
                            onPress={()=>setShowModal(false)}
                        >
                            タスクを削除しない
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )


    //現在登録されているタスクを表示していく
    //タスク名変更とタスク削除も追加
    const TaskList = ({item, index}) => (
        <View style={styles.task}>
            <TouchableOpacity onPress={()=>showDetailWindow(index)}>
                <Text style={styles.itemList}>{item}</Text>
            </TouchableOpacity>
            
            <View style={styles.taskButtons}>
                <TouchableOpacity onPress={()=>editTask(index)}>
                    <Text style={styles.editButton}>タスク名変更</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>openDeleteModal(index)}>
                    <Text style={styles.deleteButton}>タスク削除</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.title}>シンプルなToDoアプリ</Text>
            <TextInput
                style={styles.input}
                placeholder="タスク名を入力してください"
                value={taskName}
                onChangeText={(text) => setTaskName(text)}
            />
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={addTask}
            >
                <Text style={styles.addButtonText}>
                    {editIndex !== -1 ? "変更を保存" : "タスクを追加"}
                </Text>
            </TouchableOpacity>

            <FlatList
                data={taskArray} 
                renderItem={TaskList} 
                keyExtractor={(item, index) => index.toString()} 
            />

            <TaskModal visible={showModal} index={deleteIndex}/>

            {showModal? <View style={styles.modalOverLay}/> : null}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 40, 
        marginTop: 40, 
    }, 
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        marginBottom: 20, 
    }, 
    heading: { 
        fontSize: 30, 
        fontWeight: "bold", 
        marginBottom: 7, 
        color: "green", 
    }, 
    input: { 
        borderWidth: 3, 
        borderColor: "#ccc", 
        padding: 10, 
        marginBottom: 10, 
        borderRadius: 10, 
        fontSize: 18, 
    }, 
    addButton: { 
        backgroundColor: "green", 
        padding: 10, 
        borderRadius: 5, 
        marginBottom: 10, 
    }, 
    addButtonText: { 
        color: "white", 
        fontWeight: "bold", 
        textAlign: "center", 
        fontSize: 18, 
    }, 
    task: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 15, 
        fontSize: 18, 
    }, 
    itemList: { 
        fontSize: 19, 
    }, 
    taskButtons: { 
        flexDirection: "row", 
    }, 
    editButton: { 
        marginRight: 10, 
        color: "green", 
        fontWeight: "bold", 
        fontSize: 18, 
    }, 
    deleteButton: { 
        color: "red", 
        fontWeight: "bold", 
        fontSize: 18, 
    },
    modalWindow: {
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#fff", 
        height: 300,
        zIndex: 1
    },
    modalOverLay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        ...StyleSheet.absoluteFillObject,
        /* 
            StyleSheet.absoluteFillObject とは、
            以下のスタイルと同一
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            StyleSheet.absoluteFill というのもあるが、
            現状、そこまでの違いはないらしい。
        */
    }
});

export default App;
