//ReactとReactのHookを導入
import React, { useState, useEffect } from "react";

//ReactNativeのコンポーネントを導入
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    FlatList,
    ActivityIndicator
} from "react-native";

//モーダル用ライブラリ
import Modal  from "react-native-modal";

//ReactNativeのUI部品が使えるライブラリを導入
import { ListItem } from '@rneui/themed';

//表示エリアが適切な場所(画面上部と被らないなど)になるよう、自動でパディングしてくれるライブラリ
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('DB.db');


const App = () => {

    //フォームに書き込まれた内容を保持
    const [taskName, setTaskName] = useState("");

    //登録されたタスクの保持用
    const [taskArray, setTaskArray] = useState([]);

    //フロントで保持しているタスクの配列から、名称変更するタスクのインデックス
    const [editIndex, setEditIndex] = useState(-1);

    //名称変更するタスクのid(DBでの主キー)
    const [editId, setEditId] = useState(-1)

    //削除確認用モーダルの表示非表示切り替え用
    const [showModal, setShowModal] = useState(false);

    //タスクを格納した配列から、削除対象となるインデックス
    const [deleteIndex, setDeleteIndex] = useState(0);

    //削除するタスク
    const [deleteItem, setDeleteItem] = useState(0);

    //各チェックボックスの状態を管理する配列用
    const [checkArray, setCheckArray] = useState([]);

    //データベースから受け取ったデータの保持用
    const[items, setItems] = useState([]);

    //ローディングアイコン表示(trueで表示)
    const [isLoading, setIsLoading] = useState(true);


    //タスクの新規登録orタスク名の変更を保存
    const addTask = () => {
        //フォームにタスク名が入力されていれば、以下の処理を行う
        if(taskName){
            if(editIndex !== -1){
                //「editIndex !== -1」の場合、つまり、タスク名を変更中の場合なら、変更されたタスク名を保存し終了
                const updatedTasks = [...taskArray];
                updatedTasks[editIndex] = taskName;
                setTaskArray(updatedTasks);
                changeTaskName(editId);
                setEditIndex(-1);
            }else{
                //新規登録の場合は配列に追加
                setTaskArray([...taskArray, taskName]);  //タスク名を保存する配列に追加
                setCheckArray([...checkArray, false]);  //チェックボックスを管理する配列にも新規追加(初期値はfalseで未チェック)
                addTaskTable(taskName);
            }
            //処理後、フォーム欄を空欄にする
            setTaskName("");
        }
    };


    //タスク名の変更
    const editTask = (index, id) => { 
        const taskToEdit = taskArray[index]; 
        setTaskName(taskToEdit); //変更したいタスクの名前をフォームに表示させる
        setEditId(id);
        setEditIndex(index); 
    }; 


    //削除確認用モーダルの表示
    //タスク名変更中に削除確認用モーダルを開いた場合、タスク名変更処理を取りやめる
    const openDeleteModal = (index, item) => {
        setEditIndex(-1);
        setTaskName("");
        setShowModal(true);
        setDeleteIndex(index);
        setDeleteItem(item);
    };


    //タスクの削除
    //taskArrayから指定されたインデックスの要素(タスク)を削除して、 setTaskArrayでセットし直す
    //削除するタスクのチェックボックスの状態も削除
    const deleteTask = (index) => {
        const updatedTasks = [...taskArray];
        updatedTasks.splice(index, 1); 
        setTaskArray(updatedTasks);

        const updateCheckArray = [...checkArray];
        updateCheckArray.splice(index, 1); 
        setCheckArray(updateCheckArray);

        logicalDeleteTask(deleteItem);

        //モーダルを閉じる
        setShowModal(false);
    };


    //チェックボックスのチェック,未チェック切り替え
    const check = (index, item) => {
        const updateCheckArray = [...checkArray];
        updateCheckArray[index] = !updateCheckArray[index];
        setCheckArray(updateCheckArray);
        changeTaskStatus(item);
    }


    //初回レンダリング時にテーブル作成
    useEffect(() => {
        createTable();
    },[])


    //テーブルの中身確認用
    /*
        useStateの更新速度よりも、コンソールへの出力処理速度の方が遥かに早いため、
        stateが更新されたかどうかにconsole.logを用いるのであれば、以下のようにしないといけない。
        （普通にconsole.logを使うと、state更新前の値がコンソールに出力されてしまう）
    */
    useEffect(() => {
        console.log(items);
        console.log(`${items.length}件のレコードを取得しました`);
    },[items])


    //DBのテーブル作成
    const createTable = () => {
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS TaskList(id integer primary key, task_name varchar(255) not null, is_done boolean not null, is_delete boolean not null);",
                null,
                //トランザクション成功時の処理
                () => {
                    console.log("テーブルの作成に成功 or 作成予定のテーブルはすでに存在しています");
                    getData();
                },
                //トランザクション失敗時の処理
                () => {
                    console.log("テーブルの作成に失敗しました");
                    setIsLoading(false);
                    return true;  //失敗時は「return true」することでロールバックできる
                }
            );
        });
    }

    
    //テーブルにタスク追加
    const addTaskTable = (taskName) => {
        setIsLoading(true);
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "INSERT INTO TaskList(task_name, is_done, is_delete) VALUES(?, ?, ?);",
                [taskName, false, false],
                () => {
                    console.log("レコードの追加に成功しました");
                    getData();
                },
                () => {
                    console.log("レコードの追加に失敗しました");
                    setIsLoading(false);
                    return true;
                }
            );
        });
    }


    //テーブルに、タスクの完了,未完了切り替えを保存
    const changeTaskStatus = (item) => {
        setIsLoading(true);
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "UPDATE TaskList SET is_done=(?) WHERE id=(?);",
                [!item.is_done, item.id],
                () => {
                    console.log("タスクの状況変更に成功しました");
                    getData();
                },
                () => {
                    console.log("タスクの状況変更に失敗しました");
                    setIsLoading(false);
                    return true;
                }
            );
        });
    }


    //タスク名変更をDBに保存
    const changeTaskName = (id) => {
        setIsLoading(true);
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "UPDATE TaskList SET task_name=(?) WHERE id=(?);",
                [taskName, id],
                () => {
                    console.log("タスクの名称変更に成功しました");
                    setEditId(-1);
                    getData();
                },
                () => {
                    console.log("タスクの名称変更に失敗しました");
                    setIsLoading(false);
                    return true;
                }
            );
        });
    }


    //タスク削除はDB上では論理削除とする
    const logicalDeleteTask = (item) => {
        setIsLoading(true);
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "UPDATE TaskList SET is_delete=(?) WHERE id=(?);",
                [!item.is_delete, item.id],
                () => {
                    console.log("タスクの削除に成功しました");
                    setEditId(-1);
                    getData();
                },
                () => {
                    console.log("タスクの削除に失敗しました");
                    setIsLoading(false);
                    return true;
                }
            );
        });
    }


    //データベースからデータを取得
    const getData = () => {
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                "SELECT * FROM TaskList;",
                [],
                (_, resultSet) => {
                    setItems(resultSet.rows._array);

                    const taskTmpArray = [];
                    const checkTmpArray = [];

                    for(let i = 0; i<items.length; i++){
                        taskTmpArray.push(items[i].task_name);
                        checkTmpArray.push(items[i].is_done)
                    }
                    setTaskArray(taskTmpArray);
                    setCheckArray(checkTmpArray);
                },
                () => {
                    console.log("データの取得に失敗しました");
                    setIsLoading(false);
                    return false;
                }
            );
        });
        setIsLoading(false);
    };


    //DBのテーブル初期化(開発用)
    const dropTable = () => {
        db.transaction((tx) => {
            //SQL実行
            tx.executeSql(
                'DROP TABLE TaskList;',
                null,
                () => {
                    setTaskArray([]);
                    setCheckArray([]);
                    setItems([]);
                    console.log("DBのテーブルを初期化しました");
                    createTable();
                },
                () => {
                    console.log("テーブルの初期化に失敗しました");
                    return true;
                }
            );
        });
    }


    //タスク削除の確認用モーダル
    const TaskModal = () => (
        <Modal visible={showModal}>
            <View style={styles.modalWindow}>
                <Text style={{fontSize: 20, marginBottom: 25, fontWeight: "bold"}}>
                    {deleteItem.task_name} 
                </Text>
                <Text style={{fontSize: 16, marginBottom: 25, fontWeight: "bold"}}>
                    このタスクを本当に削除しますか？
                </Text>
                
                
                <View style={{justifyContent: "center", alignItems: "center"}}>
                    <TouchableOpacity onPress={() => deleteTask(deleteIndex)}>
                        <Text style={{color: "red", fontSize: 16, marginBottom: 30}}>
                            削除する
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>setShowModal(false)}>
                        <Text style={{fontSize: 16}}>
                            削除しない
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )


    //現在登録されているタスクを表示していく
    //タスク名変更とタスク削除も追加
    //各タスクごとにチェックボックスも用意
    const TaskList = ({item, index}) => (
        <View style={{display: item.is_delete? "none": null, borderBottomWidth: 1}}>
            <ListItem>
                <ListItem.Content>
                    <ListItem.Title style={styles.itemList}>
                        <Text style={item.is_done? {textDecorationLine:"line-through"} : {textDecorationLine:"none"}}>
                            {item.task_name}
                        </Text>
                    </ListItem.Title>
                    
                    <ListItem.CheckBox
                        title="完了したらチェック"
                        checkedTitle="タスク完了済み"
                        checked={item.is_done}
                        checkedColor="#367b22"
                        onPress={()=>check(index, item)}
                        containerStyle={{marginTop:10, marginBottom:15}}
                    />
            
                    <View style={styles.taskButtons}>
                        <TouchableOpacity onPress={()=>editTask(index, item.id)}>
                            <Text style={styles.editButton}>タスク名変更</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>openDeleteModal(index, item)}>
                            <Text style={styles.deleteButton}>タスク削除</Text>
                        </TouchableOpacity>
                    </View>
                </ListItem.Content>
            </ListItem>
        </View>
    );


    //ローディング中アイコン
    const Loading = () => {
        return (
            <View style={{display: isLoading? null : "none", flex: 1, justifyContent: 'center'}}>
                <ActivityIndicator 
                    size="large" 
                />
            </View>
        )
    }


    return (
        <SafeAreaProvider>
            <View style={{display: isLoading? "none" : null, ...styles.container}}>
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
                    data={items} 
                    renderItem={TaskList} 
                    keyExtractor={(item, index) => index.toString()} 
                />

               {/* 開発用のテーブル初期化ボタン */}
                <TouchableOpacity 
                    style={{
                        backgroundColor: "red", 
                        padding: 10, 
                        borderRadius: 5, 
                        marginTop: 20,
                        marginBottom: 10,
                    }} 
                    onPress={dropTable}
                >
                    <Text style={styles.addButtonText}>
                        DBのテーブル初期化(開発用)
                    </Text>
                </TouchableOpacity>

                <TaskModal visible={showModal} index={deleteIndex}/>

                {showModal? <View style={styles.modalOverLay}/> : null}
            </View>
            <Loading/>
        </SafeAreaProvider>
    )
};


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 40, 
        marginTop: 40
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
        paddingLeft: 10,
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
    itemList: { 
        fontSize: 22, 
    }, 
    taskButtons: { 
        flexDirection: "row",
    }, 
    editButton: { 
        marginRight: 10, 
        color: "green", 
        fontWeight: "bold", 
        fontSize: 14, 
    }, 
    deleteButton: { 
        color: "red", 
        fontWeight: "bold", 
        fontSize: 14, 
    },
    modalWindow: {
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#fff", 
        height: 300,
        borderRadius: 20,
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
