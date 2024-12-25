import React, { useRef } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, useParams, Navigate } from 'react-router-dom';

import Projectlist_content from "./projects/projectlist";
import MakeProjectContent from "./projects/makepro";
import AnnotationContent from './annotations/annotation';

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


const Project_list = () => {
  return(
    <div>
      <Projectlist_content />
    </div>
  )
}

const MakeProject = () => {
  return(
    <div>
      <MakeProjectContent />
    </div>
  )
}

const AnnotationWithId = () => {
  const { pid } = useParams();
  return(
    <div>
      <AnnotationContent pid={pid} />
    </div>
  )
}