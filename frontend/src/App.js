import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, useParams, Navigate } from 'react-router-dom';

import ProjectList from './components/Project/ProjectList';
import CreateProject from './components/Project/CreateProject';
import AnnotationList from './components/Annotation/AnnotationList';
import PlayGroundView from './components/PlayGround/PlayGroundView';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* リダイレクト設定 */}
          <Route path='/' element={<Navigate to='/projects' replace />} />
          
          {/* プロジェクト関連のルーティング */}
          <Route path='/projects' element={<Project_list />} />
          <Route path='/makepro' element={<MakeProject />} />
          
          {/* 注釈関連のルーティング */}
          <Route path='/annotation/:pid' element={<AnnotationWithId />} />
          <Route path='/playground' element={<PlayGroundRouter />} />
          <Route path='/testmodel/:model' element={<TestModel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


const Project_list = () => {
  return(
    <div>
      <ProjectList />
    </div>
  )
}

const MakeProject = () => {
  return(
    <div>
      <CreateProject />
    </div>
  )
}

const AnnotationWithId = () => {
  const { pid } = useParams();
  return(
    <div>
      <AnnotationList pid={pid} />
    </div>
  )
}

const PlayGroundRouter = () => {
  return(
    <div>
      <PlayGroundView modelname={""} />
    </div>
  )
}

const TestModel = () => {
  const { model } = useParams();
  console.log("model: "+model);
  return(
    <div>
      <PlayGroundView modelname={model} />
    </div>
  )
}