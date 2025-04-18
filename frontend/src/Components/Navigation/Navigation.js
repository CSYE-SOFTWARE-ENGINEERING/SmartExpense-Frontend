
import React, { useState } from 'react'
import styled from 'styled-components'
import avatar from '../../img/avatar.png'
import { signout } from '../../utils/Icons'
import { menuItems } from '../../utils/menuItems'
import { useNavigate } from 'react-router-dom'

function Navigation({active, setActive}) {
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate('/login');
    };
    
    return (
        <NavStyled>
            <div className="user-con">
                <img src={avatar} alt="" />
                <div className="text">
                    <h2>Welcome</h2>
                    <p>Your Money</p>
                </div>
            </div>
            <ul className="menu-items">
                {menuItems.map((item) => {
                    return <li
                        key={item.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActive(item.id)}
                        className={active === item.id ? 'active': ''}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                    </li>
                })}
            </ul>
            <div className="bottom-nav">
                <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    {signout} Sign Out
                </li>
            </div>
        </NavStyled>
    )
}
const NavStyled = styled.nav`
  padding: 2rem 1.5rem;
  width: 280px;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  // ✅ 改为顶部对齐
  border-right: 2px solid #e2e2e2;

  .user-con {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.2rem;

    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      background: #fcf6f9;
      border: 2px solid #FFFFFF;
      padding: .2rem;
      box-shadow: 0px 1px 17px rgba(0, 0, 0, 0.06);
    }

    h2 {
      color: rgba(34, 34, 96, 1);
      margin: 0;
    }

    p {
      color: rgba(34, 34, 96, .6);
      margin: 0;
    }
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    li {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
      color: #333;

      &:hover {
        background: #e0e7ff;
        color: #1e40af;
      }

      &.active {
        background: #4f46e5;
        color: white;
      }

      span {
        font-size: 1rem;
      }
    }
  }

  .bottom-nav {
    margin-top: auto;  // ✅ 将 Sign Out 推到底部

    li {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #ef4444;
      transition: all 0.3s ease;

      &:hover {
        background: #fee2e2;
        color: #b91c1c;
      }

      span {
        font-size: 1rem;
      }
    }
  }
`;
export default Navigation
