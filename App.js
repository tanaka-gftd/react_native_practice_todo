//ReactのHookを導入
import React, {useState} from "react";

//ReactNativeのコンポーネントを導入
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    FlatList 
} from 'react-native';

const App = () => {

    //フォームに書き込まれた内容を保持
    const [taskName, setTaskName] = useState("");

    //登録されたタスクの保持用
    const [taskArray, setTaskArray] = useState([]);

    //タスクのエディット用
    const [editIndex, setEditIndex] = useState(-1);

    //タスクの新規登録orタスク名の変更を保存
    const handleAddTask = () => {

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
    const handleEditTask = (index) => { 
        const taskToEdit = taskArray[index]; 
        setTaskName(taskToEdit); //変更したいタスクの名前をフォームに表示させる
        setEditIndex(index); 
    }; 

    //タスクの削除
    //taskArrayから指定されたインデックスの要素(タスク)を削除して、 setTaskArrayでセットし直す
    const handleDeleteTask = (index) => { 
        const updatedTasks = [...taskArray]; 
        updatedTasks.splice(index, 1); 
        setTaskArray(updatedTasks); 
    }; 

    //現在登録されているタスクを表示していく
    //タスク名変更とタスク削除も追加
    const renderItem = ({item, index}) => (
        <View style={styles.task}>
            <TouchableOpacity onPress={()=>showDetailWindow(index)}>
                <Text style={styles.itemList}>{item}</Text>
            </TouchableOpacity>
            
            <View style={styles.taskButtons}>

                <TouchableOpacity onPress={()=>handleEditTask(index)}>
                    <Text style={styles.editButton}>タスク名変更</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteTask(index)}>
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
                placeholder='タスク名を入力してください'
                value={taskName}
                onChangeText={(text) => setTaskName(text)}
            />
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddTask}
            >
                <Text style={styles.addButtonText}>
                    {editIndex !== -1 ? "変更を保存" : "タスクを追加"}
                </Text>
            </TouchableOpacity>
            <FlatList
                data={taskArray} 
                renderItem={renderItem} 
                keyExtractor={(item, index) => index.toString()} 
            />
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
});

export default App;